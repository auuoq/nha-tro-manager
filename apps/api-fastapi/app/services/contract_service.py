from datetime import date
from typing import Optional, List, Tuple
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.contract_repository import ContractRepository
from app.repositories.contract_tenant_repository import ContractTenantRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.contract import Contract
from app.models.contract_tenant import ContractTenant
from app.models.enums import ContractStatus, ContractTenantRole
from app.schemas.contract import ContractCreateSchema, ContractUpdateSchema
from app.core.exceptions import BusinessException

contract_repo = ContractRepository()
contract_tenant_repo = ContractTenantRepository()
room_repo = RoomRepository()
tenant_repo = TenantRepository()

class ContractService:
    async def get_contracts_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        room_id: Optional[str] = None,
        status_filter: Optional[ContractStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Contract, str, str]], int]:
        return await contract_repo.get_all_by_owner(
            db, owner_id, building_id=building_id, room_id=room_id, status=status_filter, page=page, page_size=page_size
        )

    async def get_contract_detail(self, db: AsyncSession, owner_id: str, contract_id: str) -> Contract:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(
                code="CONTRACT_NOT_FOUND",
                message="Hợp đồng thuê không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return contract

    async def create_contract(self, db: AsyncSession, owner_id: str, data: ContractCreateSchema) -> Contract:
        # Validate room ownership
        room = await room_repo.get_by_id(db, data.roomId, owner_id)
        if not room:
            raise BusinessException(
                code="ROOM_NOT_FOUND",
                message="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Validate primary tenant ownership
        primary_tenant = await tenant_repo.get_by_id(db, data.primaryTenantId, owner_id)
        if not primary_tenant:
            raise BusinessException(
                code="PRIMARY_TENANT_NOT_FOUND",
                message="Khách thuê đại diện không tồn tại hoặc không thuộc danh sách của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Validate member tenants
        member_tenants = []
        if data.memberTenantIds:
            for m_id in data.memberTenantIds:
                if m_id == data.primaryTenantId:
                    continue
                m_tenant = await tenant_repo.get_by_id(db, m_id, owner_id)
                if not m_tenant:
                    raise BusinessException(
                        code="MEMBER_TENANT_NOT_FOUND",
                        message=f"Khách thuê thành viên ID {m_id} không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                        status_code=status.HTTP_404_NOT_FOUND,
                    )
                member_tenants.append(m_tenant)

        code_str = await contract_repo.generate_contract_code(db)

        async with db.begin():
            contract = Contract(
                contractCode=code_str,
                roomId=data.roomId,
                startDate=data.startDate,
                endDate=data.endDate,
                monthlyPrice=data.monthlyPrice,
                depositAmount=data.depositAmount,
                billingDay=data.billingDay,
                paymentCycleMonths=data.paymentCycleMonths,
                terms=data.terms,
                status=ContractStatus.DRAFT,  # Always starts as DRAFT
            )
            await contract_repo.create(db, contract)
            await db.flush()

            # Add Primary Tenant
            ct_primary = ContractTenant(
                contractId=contract.id,
                tenantId=primary_tenant.id,
                role=ContractTenantRole.PRIMARY,
                joinedAt=data.startDate,
            )
            await contract_tenant_repo.create(db, ct_primary)

            # Add Member Tenants
            for m in member_tenants:
                ct_member = ContractTenant(
                    contractId=contract.id,
                    tenantId=m.id,
                    role=ContractTenantRole.MEMBER,
                    joinedAt=data.startDate,
                )
                await contract_tenant_repo.create(db, ct_member)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_CONTRACT",
                entity="Contract",
                entity_id=contract.id,
                details=f"Tạo dự thảo hợp đồng {contract.contractCode} cho phòng {room.roomNumber}",
            )

        return contract

    async def update_contract(
        self, db: AsyncSession, owner_id: str, contract_id: str, data: ContractUpdateSchema
    ) -> Contract:
        contract = await self.get_contract_detail(db, owner_id, contract_id)

        if contract.status != ContractStatus.DRAFT:
            raise BusinessException(
                code="INVALID_CONTRACT_STATUS",
                message="Chỉ được phép chỉnh sửa hợp đồng ở trạng thái Nháp (DRAFT)",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            if data.startDate is not None:
                contract.startDate = data.startDate
            if data.endDate is not None:
                contract.endDate = data.endDate
            if data.monthlyPrice is not None:
                contract.monthlyPrice = data.monthlyPrice
            if data.depositAmount is not None:
                contract.depositAmount = data.depositAmount
            if data.billingDay is not None:
                contract.billingDay = data.billingDay
            if data.paymentCycleMonths is not None:
                contract.paymentCycleMonths = data.paymentCycleMonths
            if data.terms is not None:
                contract.terms = data.terms

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_CONTRACT",
                entity="Contract",
                entity_id=contract.id,
                details=f"Cập nhật thông tin dự thảo hợp đồng {contract.contractCode}",
            )

        return contract
