from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.room_asset_service import RoomAssetService
from app.schemas.room import RoomAssetCreateSchema, RoomAssetUpdateSchema, RoomAssetResponseSchema
from app.schemas.common import APIResponse

router = APIRouter(prefix="/rooms", tags=["Room Assets"])
asset_service = RoomAssetService()

@router.get("/{room_id}/assets", response_model=APIResponse[List[RoomAssetResponseSchema]])
async def get_room_assets(
    room_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    assets = await asset_service.get_assets_by_room(db, current_user.id, room_id)
    return APIResponse(
        success=True,
        data=[
            RoomAssetResponseSchema(
                id=a.id,
                roomId=a.roomId,
                name=a.name,
                assetCode=a.assetCode,
                condition=a.condition,
                quantity=a.quantity,
                note=a.note,
                createdAt=a.createdAt,
                updatedAt=a.updatedAt,
            )
            for a in assets
        ],
        message="Lấy danh sách trang thiết bị phòng thành công",
    )

@router.post("/{room_id}/assets", response_model=APIResponse[RoomAssetResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_room_asset(
    room_id: str,
    body: RoomAssetCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    asset = await asset_service.create_asset(db, current_user.id, room_id, body)
    return APIResponse(
        success=True,
        data=RoomAssetResponseSchema(
            id=asset.id,
            roomId=asset.roomId,
            name=asset.name,
            assetCode=asset.assetCode,
            condition=asset.condition,
            quantity=asset.quantity,
            note=asset.note,
            createdAt=asset.createdAt,
            updatedAt=asset.updatedAt,
        ),
        message="Thêm trang thiết bị phòng thành công",
    )

@router.patch("/{room_id}/assets/{asset_id}", response_model=APIResponse[RoomAssetResponseSchema])
async def update_room_asset(
    room_id: str,
    asset_id: str,
    body: RoomAssetUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    asset = await asset_service.update_asset(db, current_user.id, asset_id, body)
    return APIResponse(
        success=True,
        data=RoomAssetResponseSchema(
            id=asset.id,
            roomId=asset.roomId,
            name=asset.name,
            assetCode=asset.assetCode,
            condition=asset.condition,
            quantity=asset.quantity,
            note=asset.note,
            createdAt=asset.createdAt,
            updatedAt=asset.updatedAt,
        ),
        message="Cập nhật trang thiết bị phòng thành công",
    )

@router.delete("/{room_id}/assets/{asset_id}", response_model=APIResponse[dict])
async def delete_room_asset(
    room_id: str,
    asset_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await asset_service.soft_delete_asset(db, current_user.id, asset_id)
    return APIResponse(
        success=True,
        data={"assetId": asset_id},
        message="Xóa trang thiết bị phòng thành công",
    )
