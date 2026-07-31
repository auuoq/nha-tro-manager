from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.meter_repository import MeterRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.meter import Meter
from app.models.enums import MeterType
from app.schemas.meter import MeterCreateSchema, MeterUpdateSchema, MeterReplaceSchema
from app.core.exceptions import BusinessException

meter_repo = MeterRepository()
room_repo = RoomRepository()

class MeterService:
    async def get_meters_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        room_id: Optional[str] = None,
        meter_type: Optional[MeterType] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Meter, str, str]], int]:
        return await meter_repo.get_all_by_owner(
            db, owner_id, building_id=building_id, room_id=room_id, meter_type=meter_type, is_active=is_active, page=page, page_size=page_size
        )

    async def get_meter_detail(self, db: AsyncSession, owner_id: str, meter_id: str) -> Meter:
        meter = await meter_repo.get_by_id(db, meter_id, owner_id)
        if not meter:
            raise BusinessException(
                code="METER_NOT_FOUND",
                message="Đồng hồ không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return meter

    async def create_meter(self, db: AsyncSession, owner_id: str, data: MeterCreateSchema) -> Meter:
        room = await room_repo.get_by_id(db, data.roomId, owner_id)
        if not room:
            raise BusinessException(
                code="ROOM_NOT_FOUND",
                message="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Check existing active meter of same type in room
        active_meter = await meter_repo.get_active_by_room_and_type(db, data.roomId, data.type)
        if active_meter:
            raise BusinessException(
                code="METER_ALREADY_ACTIVE",
                message=f"Phòng {room.roomNumber} đã có 1 đồng hồ loại {data.type.value} đang hoạt động. Hãy dùng API /replace nếu cần thay đồng hồ.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            meter = Meter(
                roomId=data.roomId,
                type=data.type,
                serialNumber=data.serialNumber.strip(),
                initialReading=data.initialReading,
                isActive=True,
                installedAt=data.installedAt,
            )
            await meter_repo.create(db, meter)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_METER",
                entity="Meter",
                entity_id=meter.id,
                details=f"Lắp đặt đồng hồ {meter.type.value} sê-ri {meter.serialNumber} tại phòng {room.roomNumber}",
            )

        return meter

    async def replace_meter(
        self, db: AsyncSession, owner_id: str, meter_id: str, body: MeterReplaceSchema
    ) -> Meter:
        async with db.begin():
            old_meter = await meter_repo.get_by_id(db, meter_id, owner_id, lock=True)
            if not old_meter:
                raise BusinessException(
                    code="METER_NOT_FOUND",
                    message="Đồng hồ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if not old_meter.isActive:
                raise BusinessException(
                    code="METER_NOT_ACTIVE",
                    message="Chỉ có thể thay thế đồng hồ đang ở trạng thái hoạt động (isActive = True)",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Deactivate old meter
            old_meter.isActive = False
            old_meter.removedAt = body.replacedAt

            # Create new meter
            new_meter = Meter(
                roomId=old_meter.roomId,
                type=old_meter.type,
                serialNumber=body.newSerialNumber.strip(),
                initialReading=body.newInitialReading,
                isActive=True,
                installedAt=body.replacedAt,
            )
            await meter_repo.create(db, new_meter)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="REPLACE_METER",
                entity="Meter",
                entity_id=new_meter.id,
                details=f"Thay thế đồng hồ sê-ri {old_meter.serialNumber} bằng sê-ri mới {new_meter.serialNumber}. Lý do: {body.reason}",
            )

        return new_meter
