from datetime import date
from typing import List
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.contract_tenant_repository import ContractTenantRepository
from app.repositories.contract_repository import ContractRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.contract_tenant import ContractTenant
from app.models.enums import ContractTenantRole
from app.schemas.contract_tenant import ContractTenantCreateSchema, ChangePrimaryTenantSchema
from app.core.exceptions import BusinessException

ct_repo = ContractTenantRepository()
contract_repo = ContractRepository()
tenant_repo = TenantRepository()

class ContractTenantService:
    async def get_contract_tenants(
        self, db: AsyncSession, owner_id: str, contract_id: str
    ) -> List[ContractTenant]:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(
                code="CONTRACT_NOT_FOUND",
                message="Hợp đồng không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return await ct_repo.get_all_by_contract(db, contract_id, active_only=False)

    async def add_tenant_to_contract(
        self, db: AsyncSession, owner_id: str, contract_id: str, body: ContractTenantCreateSchema
    ) -> ContractTenant:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(
                code="CONTRACT_NOT_FOUND",
                message="Hợp đồng không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        tenant = await tenant_repo.get_by_id(db, body.tenantId, owner_id)
        if not tenant:
            raise BusinessException(
                code="TENANT_NOT_FOUND",
                message="Khách thuê không tồn tại hoặc không thuộc quyền quản lý của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Check existing active relation
        existing = await ct_repo.get_by_contract_and_tenant(db, contract_id, body.tenantId)
        if existing and existing.leftAt is None:
            raise BusinessException(
                code="TENANT_ALREADY_IN_CONTRACT",
                message=f"Khách thuê {tenant.fullName} đã tham gia trong hợp đồng này",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # If adding as PRIMARY, check existing primary
        if body.role == ContractTenantRole.PRIMARY:
            current_primary = await ct_repo.get_active_primary(db, contract_id)
            if current_primary:
                raise BusinessException(
                    code="PRIMARY_TENANT_ALREADY_EXISTS",
                    message="Hợp đồng đã có 1 đại diện PRIMARY. Hãy dùng API /change-primary để chuyển quyền đại diện.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        async with db.begin():
            if existing and existing.leftAt is not None:
                existing.leftAt = None
                existing.role = body.role
                existing.joinedAt = body.joinedAt
                ct_obj = existing
            else:
                ct_obj = ContractTenant(
                    contractId=contract_id,
                    tenantId=body.tenantId,
                    role=body.role,
                    joinedAt=body.joinedAt,
                )
                await ct_repo.create(db, ct_obj)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="ADD_CONTRACT_TENANT",
                entity="ContractTenant",
                entity_id=ct_obj.id,
                details=f"Thêm khách thuê {tenant.fullName} (vai trò {body.role.value}) vào hợp đồng {contract.contractCode}",
            )

        return ct_obj

    async def remove_tenant_from_contract(
        self, db: AsyncSession, owner_id: str, contract_id: str, tenant_id: str
    ) -> None:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(code="CONTRACT_NOT_FOUND", message="Hợp đồng không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

        relation = await ct_repo.get_by_contract_and_tenant(db, contract_id, tenant_id)
        if not relation or relation.leftAt is not None:
            raise BusinessException(
                code="TENANT_NOT_IN_CONTRACT",
                message="Khách thuê không có mặt trong hợp đồng này",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if relation.role == ContractTenantRole.PRIMARY:
            raise BusinessException(
                code="CANNOT_REMOVE_PRIMARY_TENANT",
                message="Không thể xóa khách thuê đại diện (PRIMARY). Hãy đổi khách thuê đại diện khác trước khi xóa.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            relation.leftAt = date.today()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="REMOVE_CONTRACT_TENANT",
                entity="ContractTenant",
                entity_id=relation.id,
                details=f"Rời khách thuê khỏi hợp đồng {contract.contractCode}",
            )

    async def change_primary_tenant(
        self, db: AsyncSession, owner_id: str, contract_id: str, body: ChangePrimaryTenantSchema
    ) -> None:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(code="CONTRACT_NOT_FOUND", message="Hợp đồng không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

        target_relation = await ct_repo.get_by_contract_and_tenant(db, contract_id, body.newPrimaryTenantId)
        if not target_relation or target_relation.leftAt is not None:
            raise BusinessException(
                code="TENANT_NOT_IN_CONTRACT",
                message="Khách thuê đại diện mới phải là thành viên active đang ở trong hợp đồng",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            current_primary = await ct_repo.get_active_primary(db, contract_id)
            if current_primary:
                current_primary.role = ContractTenantRole.MEMBER

            target_relation.role = ContractTenantRole.PRIMARY

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CHANGE_PRIMARY_TENANT",
                entity="ContractTenant",
                entity_id=target_relation.id,
                details=f"Đổi khách thuê đại diện hợp đồng {contract.contractCode} sang tenant ID {body.newPrimaryTenantId}",
            )
