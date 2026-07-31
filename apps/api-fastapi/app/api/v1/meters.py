from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.models.enums import MeterType
from app.services.meter_service import MeterService
from app.schemas.meter import MeterCreateSchema, MeterUpdateSchema, MeterReplaceSchema, MeterResponseSchema
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/meters", tags=["Meters"])
meter_service = MeterService()

@router.get("", response_model=APIResponse[PaginatedData[MeterResponseSchema]])
async def get_meters(
    buildingId: Optional[str] = Query(default=None, description="Lọc theo Tòa nhà"),
    roomId: Optional[str] = Query(default=None, description="Lọc theo Phòng trọ"),
    type: Optional[MeterType] = Query(default=None, description="Lọc theo Loại đồng hồ"),
    isActive: Optional[bool] = Query(default=None, description="Lọc theo Trạng thái hoạt động"),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await meter_service.get_meters_by_owner(
        db, current_user.id, building_id=buildingId, room_id=roomId, meter_type=type, is_active=isActive, page=page, page_size=pageSize
    )
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    response_items = [
        MeterResponseSchema(
            id=m.id,
            roomId=m.roomId,
            roomNumber=r_num,
            buildingName=b_name,
            type=m.type,
            serialNumber=m.serialNumber,
            initialReading=m.initialReading,
            isActive=m.isActive,
            installedAt=m.installedAt,
            removedAt=m.removedAt,
            createdAt=m.createdAt,
            updatedAt=m.updatedAt,
        )
        for m, r_num, b_name in items
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
        message="Lấy danh sách đồng hồ thành công",
    )

@router.post("", response_model=APIResponse[MeterResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_meter(
    body: MeterCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    meter = await meter_service.create_meter(db, current_user.id, body)
    return APIResponse(
        success=True,
        data=MeterResponseSchema(
            id=meter.id,
            roomId=meter.roomId,
            roomNumber=meter.room.roomNumber if meter.room else None,
            buildingName=meter.room.building.name if meter.room and meter.room.building else None,
            type=meter.type,
            serialNumber=meter.serialNumber,
            initialReading=meter.initialReading,
            isActive=meter.isActive,
            installedAt=meter.installedAt,
            removedAt=meter.removedAt,
            createdAt=meter.createdAt,
            updatedAt=meter.updatedAt,
        ),
        message="Lắp đặt đồng hồ mới thành công",
    )

@router.get("/{meter_id}", response_model=APIResponse[MeterResponseSchema])
async def get_meter_detail(
    meter_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    meter = await meter_service.get_meter_detail(db, current_user.id, meter_id)
    return APIResponse(
        success=True,
        data=MeterResponseSchema(
            id=meter.id,
            roomId=meter.roomId,
            roomNumber=meter.room.roomNumber if meter.room else None,
            buildingName=meter.room.building.name if meter.room and meter.room.building else None,
            type=meter.type,
            serialNumber=meter.serialNumber,
            initialReading=meter.initialReading,
            isActive=meter.isActive,
            installedAt=meter.installedAt,
            removedAt=meter.removedAt,
            createdAt=meter.createdAt,
            updatedAt=meter.updatedAt,
        ),
        message="Lấy thông tin chi tiết đồng hồ thành công",
    )

@router.post("/{meter_id}/replace", response_model=APIResponse[MeterResponseSchema])
async def replace_meter(
    meter_id: str,
    body: MeterReplaceSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    new_meter = await meter_service.replace_meter(db, current_user.id, meter_id, body)
    return APIResponse(
        success=True,
        data=MeterResponseSchema(
            id=new_meter.id,
            roomId=new_meter.roomId,
            roomNumber=new_meter.room.roomNumber if new_meter.room else None,
            buildingName=new_meter.room.building.name if new_meter.room and new_meter.room.building else None,
            type=new_meter.type,
            serialNumber=new_meter.serialNumber,
            initialReading=new_meter.initialReading,
            isActive=new_meter.isActive,
            installedAt=new_meter.installedAt,
            removedAt=new_meter.removedAt,
            createdAt=new_meter.createdAt,
            updatedAt=new_meter.updatedAt,
        ),
        message=f"Thay thế đồng hồ sê-ri mới {new_meter.serialNumber} thành công",
    )
