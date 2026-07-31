from datetime import date
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.contract_repository import ContractRepository
from app.repositories.contract_tenant_repository import ContractTenantRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.contract import Contract
from app.models.room import Room
from app.models.enums import ContractStatus, RoomStatus, ContractTenantRole
from app.schemas.contract import ContractTerminateSchema, ContractCancelSchema
from app.core.exceptions import BusinessException

contract_repo = ContractRepository()
contract_tenant_repo = ContractTenantRepository()
room_repo = RoomRepository()

class ContractLifecycleService:
    async def activate_contract(self, db: AsyncSession, owner_id: str, contract_id: str) -> Contract:
        async with db.begin():
            # Lock contract
            contract = await contract_repo.get_by_id(db, contract_id, owner_id, lock=True)
            if not contract:
                raise BusinessException(
                    code="CONTRACT_NOT_FOUND",
                    message="Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if contract.status != ContractStatus.DRAFT:
                raise BusinessException(
                    code="INVALID_CONTRACT_STATUS",
                    message=f"Chỉ có thể Kích hoạt (ACTIVE) hợp đồng ở trạng thái DRAFT. Trạng thái hiện tại: {contract.status.value}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Lock room
            room_stmt = select(Room).where(Room.id == contract.roomId, Room.deletedAt.is_(None)).with_for_update()
            room_res = await db.execute(room_stmt)
            room = room_res.scalar_one_or_none()

            if not room:
                raise BusinessException(code="ROOM_NOT_FOUND", message="Phòng trọ không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

            if room.status == RoomStatus.MAINTENANCE:
                raise BusinessException(
                    code="ROOM_IN_MAINTENANCE",
                    message=f"Không thể kích hoạt hợp đồng vì phòng {room.roomNumber} đang trong trạng thái bảo trì (MAINTENANCE)",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Check primary tenant requirement
            primary_tenant = await contract_tenant_repo.get_active_primary(db, contract.id)
            if not primary_tenant:
                raise BusinessException(
                    code="PRIMARY_TENANT_REQUIRED",
                    message="Hợp đồng phải có đúng 1 Khách thuê đại diện (PRIMARY) active trước khi kích hoạt",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Check direct contract date overlap
            overlaps = await contract_repo.find_overlapping_active_contracts(
                db, contract.roomId, contract.startDate, contract.endDate, exclude_id=contract.id
            )
            if overlaps:
                raise BusinessException(
                    code="CONTRACT_OVERLAP",
                    message=f"Phòng {room.roomNumber} đã có hợp đồng ACTIVE trùng lặp khoảng thời gian thuê.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Update statuses
            contract.status = ContractStatus.ACTIVE
            room.status = RoomStatus.RENTED

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="ACTIVATE_CONTRACT",
                entity="Contract",
                entity_id=contract.id,
                details=f"Kích hoạt hiệu lực hợp đồng {contract.contractCode} cho phòng {room.roomNumber}",
            )

        return contract

    async def terminate_contract(
        self, db: AsyncSession, owner_id: str, contract_id: str, body: ContractTerminateSchema
    ) -> Contract:
        # Validate returned + deduction <= depositAmount
        if (body.returnedAmount + body.deductionAmount) > Decimal(0):
            pass  # Pydantic validates non-negative

        async with db.begin():
            contract = await contract_repo.get_by_id(db, contract_id, owner_id, lock=True)
            if not contract:
                raise BusinessException(
                    code="CONTRACT_NOT_FOUND",
                    message="Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if contract.status not in [ContractStatus.ACTIVE, ContractStatus.EXPIRING]:
                raise BusinessException(
                    code="INVALID_CONTRACT_STATUS",
                    message=f"Chỉ có thể kết thúc hợp đồng đang có hiệu lực (ACTIVE). Trạng thái hiện tại: {contract.status.value}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            if (body.returnedAmount + body.deductionAmount) > contract.depositAmount:
                raise BusinessException(
                    code="INVALID_DEPOSIT_SETTLEMENT",
                    message=f"Tổng tiền cọc hoàn trả ({body.returnedAmount}) và khấu trừ ({body.deductionAmount}) vượt quá tiền cọc gốc ({contract.depositAmount})",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            contract.status = ContractStatus.TERMINATED
            contract.actualEndDate = body.actualMoveOutDate
            contract.terminationReason = body.terminationReason.strip()
            contract.returnedDeposit = body.returnedAmount
            contract.depositDeductions = body.deductionAmount

            # Set leftAt for all active contract tenants
            active_tenants = await contract_tenant_repo.get_all_by_contract(db, contract.id, active_only=True)
            for ct in active_tenants:
                ct.leftAt = body.actualMoveOutDate

            # Check remaining active contracts on room
            other_active = await contract_repo.find_overlapping_active_contracts(
                db, contract.roomId, date.today(), date.today(), exclude_id=contract.id
            )
            if not other_active:
                room_stmt = select(Room).where(Room.id == contract.roomId).with_for_update()
                r_res = await db.execute(room_stmt)
                room = r_res.scalar_one_or_none()
                if room:
                    room.status = RoomStatus.VACANT

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="TERMINATE_CONTRACT",
                entity="Contract",
                entity_id=contract.id,
                details=f"Thanh lý kết thúc hợp đồng {contract.contractCode}. Lý do: {contract.terminationReason}",
            )

        return contract

    async def cancel_contract(
        self, db: AsyncSession, owner_id: str, contract_id: str, body: ContractCancelSchema
    ) -> Contract:
        async with db.begin():
            contract = await contract_repo.get_by_id(db, contract_id, owner_id, lock=True)
            if not contract:
                raise BusinessException(
                    code="CONTRACT_NOT_FOUND",
                    message="Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if contract.status != ContractStatus.DRAFT:
                raise BusinessException(
                    code="INVALID_CONTRACT_STATUS",
                    message="Chỉ được phép Hủy (CANCEL) dự thảo hợp đồng ở trạng thái DRAFT",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            contract.status = ContractStatus.CANCELLED
            contract.cancellationReason = body.cancellationReason.strip()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CANCEL_CONTRACT",
                entity="Contract",
                entity_id=contract.id,
                details=f"Hủy dự thảo hợp đồng {contract.contractCode}. Lý do: {contract.cancellationReason}",
            )

        return contract
