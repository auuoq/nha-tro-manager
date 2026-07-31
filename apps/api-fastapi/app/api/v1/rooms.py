from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.models.enums import RoomStatus
from app.services.room_service import RoomService
from app.services.charge_config_service import ChargeConfigService
from app.schemas.room import (
    RoomCreateSchema,
    RoomUpdateSchema,
    RoomResponseSchema,
    RoomMaintenanceStatusUpdateSchema,
)
from app.schemas.charge_config import ChargeConfigCreateSchema, ChargeConfigUpdateSchema, ChargeConfigResponseSchema
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/rooms", tags=["Rooms"])
room_service = RoomService()
charge_config_service = ChargeConfigService()

@router.get("", response_model=APIResponse[PaginatedData[RoomResponseSchema]])
async def get_rooms(
    buildingId: Optional[str] = Query(default=None, description="Lọc theo Tòa nhà"),
    status: Optional[RoomStatus] = Query(default=None, description="Lọc theo Trạng thái phòng"),
    search: Optional[str] = Query(default=None, description="Tìm kiếm theo số phòng"),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await room_service.get_rooms_by_owner(
        db, current_user.id, building_id=buildingId, status_filter=status, search=search, page=page, page_size=pageSize
    )
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    response_items = [
        RoomResponseSchema(
            id=r.id,
            buildingId=r.buildingId,
            buildingName=b_name,
            roomNumber=r.roomNumber,
            floor=r.floor,
            roomType=r.roomType,
            basePrice=r.basePrice,
            areaSqM=r.areaSqM,
            status=r.status,
            createdAt=r.createdAt,
            updatedAt=r.updatedAt,
        )
        for r, b_name in items
    ]

    return APIResponse(
        success=True,
        data=PaginatedData(
            items=response_items,
            page=page,
            pageSize=pageSize,
            total=total,
            totalPages=total_pages,
        ),
        message="Lấy danh sách phòng trọ thành công",
    )

@router.post("", response_model=APIResponse[RoomResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_room(
    body: RoomCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.create_room(db, current_user.id, body)
    return APIResponse(
        success=True,
        data=RoomResponseSchema(
            id=room.id,
            buildingId=room.buildingId,
            roomNumber=room.roomNumber,
            floor=room.floor,
            roomType=room.roomType,
            basePrice=room.basePrice,
            areaSqM=room.areaSqM,
            status=room.status,
            createdAt=room.createdAt,
            updatedAt=room.updatedAt,
        ),
        message="Tạo phòng trọ mới thành công",
    )

@router.get("/{room_id}", response_model=APIResponse[RoomResponseSchema])
async def get_room_detail(
    room_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.get_room_detail(db, current_user.id, room_id)
    return APIResponse(
        success=True,
        data=RoomResponseSchema(
            id=room.id,
            buildingId=room.buildingId,
            buildingName=room.building.name if room.building else None,
            roomNumber=room.roomNumber,
            floor=room.floor,
            roomType=room.roomType,
            basePrice=room.basePrice,
            areaSqM=room.areaSqM,
            status=room.status,
            createdAt=room.createdAt,
            updatedAt=room.updatedAt,
        ),
        message="Lấy thông tin chi tiết phòng trọ thành công",
    )

@router.patch("/{room_id}", response_model=APIResponse[RoomResponseSchema])
async def update_room(
    room_id: str,
    body: RoomUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.update_room(db, current_user.id, room_id, body)
    return APIResponse(
        success=True,
        data=RoomResponseSchema(
            id=room.id,
            buildingId=room.buildingId,
            roomNumber=room.roomNumber,
            floor=room.floor,
            roomType=room.roomType,
            basePrice=room.basePrice,
            areaSqM=room.areaSqM,
            status=room.status,
            createdAt=room.createdAt,
            updatedAt=room.updatedAt,
        ),
        message="Cập nhật thông tin phòng trọ thành công",
    )

@router.patch("/{room_id}/maintenance-status", response_model=APIResponse[RoomResponseSchema])
async def update_maintenance_status(
    room_id: str,
    body: RoomMaintenanceStatusUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    room = await room_service.update_maintenance_status(db, current_user.id, room_id, body)
    return APIResponse(
        success=True,
        data=RoomResponseSchema(
            id=room.id,
            buildingId=room.buildingId,
            roomNumber=room.roomNumber,
            floor=room.floor,
            roomType=room.roomType,
            basePrice=room.basePrice,
            areaSqM=room.areaSqM,
            status=room.status,
            createdAt=room.createdAt,
            updatedAt=room.updatedAt,
        ),
        message=f"Chuyển trạng thái bảo trì phòng {room.roomNumber} thành công sang {room.status.value}",
    )

@router.delete("/{room_id}", response_model=APIResponse[dict])
async def delete_room(
    room_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await room_service.soft_delete_room(db, current_user.id, room_id)
    return APIResponse(
        success=True,
        data={"roomId": room_id},
        message="Lưu trữ phòng trọ thành công",
    )

# Room Charge Configs
@router.get("/{room_id}/charge-configs", response_model=APIResponse[List[ChargeConfigResponseSchema]])
async def get_room_charge_configs(
    room_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    configs = await charge_config_service.get_room_charge_configs(db, current_user.id, room_id)
    return APIResponse(
        success=True,
        data=[
            ChargeConfigResponseSchema(
                id=c.id,
                buildingId=c.buildingId,
                roomId=c.roomId,
                contractId=c.contractId,
                chargeType=c.chargeType,
                chargeMethod=c.chargeMethod,
                unitPrice=c.unitPrice,
                effectiveFrom=c.effectiveFrom,
                effectiveTo=c.effectiveTo,
                createdAt=c.createdAt,
                updatedAt=c.updatedAt,
            )
            for c in configs
        ],
        message="Lấy danh sách cấu hình chi phí riêng cho phòng thành công",
    )

@router.post("/{room_id}/charge-configs", response_model=APIResponse[ChargeConfigResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_room_charge_config(
    room_id: str,
    body: ChargeConfigCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    config = await charge_config_service.create_room_charge_config(db, current_user.id, room_id, body)
    return APIResponse(
        success=True,
        data=ChargeConfigResponseSchema(
            id=config.id,
            buildingId=config.buildingId,
            roomId=config.roomId,
            contractId=config.contractId,
            chargeType=config.chargeType,
            chargeMethod=config.chargeMethod,
            unitPrice=config.unitPrice,
            effectiveFrom=config.effectiveFrom,
            effectiveTo=config.effectiveTo,
            createdAt=config.createdAt,
            updatedAt=config.updatedAt,
        ),
        message="Tạo cấu hình chi phí riêng cho phòng thành công",
    )

@router.patch("/{room_id}/charge-configs/{config_id}", response_model=APIResponse[ChargeConfigResponseSchema])
async def update_room_charge_config(
    room_id: str,
    config_id: str,
    body: ChargeConfigUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    config = await charge_config_service.update_room_charge_config(db, current_user.id, room_id, config_id, body)
    return APIResponse(
        success=True,
        data=ChargeConfigResponseSchema(
            id=config.id,
            buildingId=config.buildingId,
            roomId=config.roomId,
            contractId=config.contractId,
            chargeType=config.chargeType,
            chargeMethod=config.chargeMethod,
            unitPrice=config.unitPrice,
            effectiveFrom=config.effectiveFrom,
            effectiveTo=config.effectiveTo,
            createdAt=config.createdAt,
            updatedAt=config.updatedAt,
        ),
        message="Cập nhật cấu hình chi phí riêng cho phòng thành công",
    )
