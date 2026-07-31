from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.room_asset import RoomAsset
from app.models.room import Room
from app.models.building import Building

class RoomAssetRepository:
    async def get_by_id(self, db: AsyncSession, asset_id: str, owner_id: Optional[str] = None) -> Optional[RoomAsset]:
        query = (
            select(RoomAsset)
            .join(Room, RoomAsset.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(RoomAsset.id == asset_id, RoomAsset.deletedAt.is_(None), Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_all_by_room(self, db: AsyncSession, room_id: str, owner_id: Optional[str] = None) -> List[RoomAsset]:
        query = (
            select(RoomAsset)
            .join(Room, RoomAsset.roomId == Room.id)
            .join(Building, Room.buildingId == Building.id)
            .where(RoomAsset.roomId == room_id, RoomAsset.deletedAt.is_(None), Room.deletedAt.is_(None), Building.deletedAt.is_(None))
        )
        if owner_id:
            query = query.where(Building.ownerId == owner_id)
        query = query.order_by(RoomAsset.name.asc())
        res = await db.execute(query)
        return list(res.scalars().all())

    async def create(self, db: AsyncSession, asset: RoomAsset) -> RoomAsset:
        db.add(asset)
        return asset
