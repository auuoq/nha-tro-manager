from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.room_repository import RoomRepository
from app.repositories.building_repository import BuildingRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.room import Room
from app.models.enums import RoomStatus
from app.schemas.room import RoomCreateSchema, RoomUpdateSchema, RoomMaintenanceStatusUpdateSchema

room_repo = RoomRepository()
building_repo = BuildingRepository()

class RoomService:
    async def get_rooms_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        status_filter: Optional[RoomStatus] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Room, str]], int]:
        return await room_repo.get_all_by_owner(
            db, owner_id, building_id=building_id, status=status_filter, search=search, page=page, page_size=page_size
        )

    async def get_room_detail(self, db: AsyncSession, owner_id: str, room_id: str) -> Room:
        room = await room_repo.get_by_id(db, room_id, owner_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phòng trọ không tồn tại hoặc bạn không có quyền truy cập",
            )
        return room

    async def create_room(self, db: AsyncSession, owner_id: str, data: RoomCreateSchema) -> Room:
        # Validate building ownership
        building = await building_repo.get_by_id(db, data.buildingId, owner_id)
        if not building:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tòa nhà chỉ định không tồn tại hoặc không thuộc quyền sở hữu của bạn",
            )

        # Validate unique roomNumber in building
        existing = await room_repo.get_by_building_and_number(db, data.buildingId, data.roomNumber)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Số phòng {data.roomNumber} đã tồn tại trong tòa nhà {building.name}",
            )

        async with db.begin():
            room = Room(
                buildingId=data.buildingId,
                roomNumber=data.roomNumber.strip(),
                floor=data.floor,
                roomType=data.roomType,
                basePrice=data.basePrice,
                areaSqM=data.areaSqM,
                status=RoomStatus.VACANT,  # Default VACANT
            )
            await room_repo.create(db, room)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_ROOM",
                entity="Room",
                entity_id=room.id,
                details=f"Tạo phòng {room.roomNumber} tại tòa nhà {building.name}",
            )

        return room

    async def update_room(self, db: AsyncSession, owner_id: str, room_id: str, data: RoomUpdateSchema) -> Room:
        room = await self.get_room_detail(db, owner_id, room_id)

        # Check unique roomNumber if changing number
        if data.roomNumber and data.roomNumber.strip() != room.roomNumber:
            existing = await room_repo.get_by_building_and_number(db, room.buildingId, data.roomNumber)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Số phòng {data.roomNumber} đã tồn tại trong tòa nhà này",
                )

        async with db.begin():
            if data.roomNumber is not None:
                room.roomNumber = data.roomNumber.strip()
            if data.floor is not None:
                room.floor = data.floor
            if data.roomType is not None:
                room.roomType = data.roomType
            if data.basePrice is not None:
                room.basePrice = data.basePrice
            if data.areaSqM is not None:
                room.areaSqM = data.areaSqM

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_ROOM",
                entity="Room",
                entity_id=room.id,
                details=f"Cập nhật thông tin phòng {room.roomNumber}",
            )

        return room

    async def update_maintenance_status(
        self, db: AsyncSession, owner_id: str, room_id: str, body: RoomMaintenanceStatusUpdateSchema
    ) -> Room:
        room = await self.get_room_detail(db, owner_id, room_id)
        target_status = body.status

        # Strict transition rules: ONLY VACANT <-> MAINTENANCE
        if target_status not in [RoomStatus.VACANT, RoomStatus.MAINTENANCE]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Endpoint này chỉ cho phép chuyển đổi giữa VACANT và MAINTENANCE",
            )

        if room.status == RoomStatus.RENTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể đưa phòng đang có khách thuê (RENTED) vào trạng thái bảo trì",
            )

        async with db.begin():
            old_status = room.status
            room.status = target_status

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CHANGE_ROOM_MAINTENANCE_STATUS",
                entity="Room",
                entity_id=room.id,
                details=f"Chuyển trạng thái phòng {room.roomNumber} từ {old_status} sang {target_status}",
            )

        return room

    async def soft_delete_room(self, db: AsyncSession, owner_id: str, room_id: str) -> None:
        room = await self.get_room_detail(db, owner_id, room_id)

        if room.status == RoomStatus.RENTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể xóa phòng {room.roomNumber} vì đang trong trạng thái Đang cho thuê (RENTED)",
            )

        active_contracts = await room_repo.count_active_contracts(db, room_id)
        if active_contracts > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể xóa phòng {room.roomNumber} vì đang có {active_contracts} hợp đồng đang hoạt động",
            )

        async with db.begin():
            room.deletedAt = datetime.now()
            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="DELETE_ROOM",
                entity="Room",
                entity_id=room.id,
                details=f"Lưu trữ phòng {room.roomNumber}",
            )
