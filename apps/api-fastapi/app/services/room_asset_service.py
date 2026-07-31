from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.room_asset_repository import RoomAssetRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.room_asset import RoomAsset
from app.schemas.room import RoomAssetCreateSchema, RoomAssetUpdateSchema

asset_repo = RoomAssetRepository()
room_repo = RoomRepository()

class RoomAssetService:
    async def get_assets_by_room(self, db: AsyncSession, owner_id: str, room_id: str) -> List[RoomAsset]:
        # Validate room ownership
        room = await room_repo.get_by_id(db, room_id, owner_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
            )
        return await asset_repo.get_all_by_room(db, room_id, owner_id)

    async def create_asset(
        self, db: AsyncSession, owner_id: str, room_id: str, data: RoomAssetCreateSchema
    ) -> RoomAsset:
        room = await room_repo.get_by_id(db, room_id, owner_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
            )

        async with db.begin():
            asset = RoomAsset(
                roomId=room_id,
                name=data.name.strip(),
                assetCode=data.assetCode,
                condition=data.condition,
                quantity=data.quantity,
                note=data.note,
            )
            await asset_repo.create(db, asset)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_ROOM_ASSET",
                entity="RoomAsset",
                entity_id=asset.id,
                details=f"Thêm thiết bị {asset.name} cho phòng {room.roomNumber}",
            )

        return asset

    async def update_asset(
        self, db: AsyncSession, owner_id: str, asset_id: str, data: RoomAssetUpdateSchema
    ) -> RoomAsset:
        asset = await asset_repo.get_by_id(db, asset_id, owner_id)
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trang thiết bị không tồn tại hoặc bạn không có quyền truy cập",
            )

        async with db.begin():
            if data.name is not None:
                asset.name = data.name.strip()
            if data.assetCode is not None:
                asset.assetCode = data.assetCode
            if data.condition is not None:
                asset.condition = data.condition
            if data.quantity is not None:
                asset.quantity = data.quantity
            if data.note is not None:
                asset.note = data.note

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_ROOM_ASSET",
                entity="RoomAsset",
                entity_id=asset.id,
                details=f"Cập nhật thông tin thiết bị {asset.name}",
            )

        return asset

    async def soft_delete_asset(self, db: AsyncSession, owner_id: str, asset_id: str) -> None:
        asset = await asset_repo.get_by_id(db, asset_id, owner_id)
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trang thiết bị không tồn tại hoặc bạn không có quyền truy cập",
            )

        async with db.begin():
            asset.deletedAt = datetime.now()
            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="DELETE_ROOM_ASSET",
                entity="RoomAsset",
                entity_id=asset.id,
                details=f"Xóa thiết bị {asset.name}",
            )
