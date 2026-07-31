from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.building_repository import BuildingRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.building import Building
from app.schemas.building import BuildingCreateSchema, BuildingUpdateSchema

building_repo = BuildingRepository()

class BuildingService:
    async def get_buildings_by_owner(
        self, db: AsyncSession, owner_id: str, page: int = 1, page_size: int = 20
    ) -> Tuple[List[Building], int]:
        return await building_repo.get_all_by_owner(db, owner_id, page, page_size)

    async def get_building_detail(self, db: AsyncSession, owner_id: str, building_id: str) -> Building:
        building = await building_repo.get_by_id(db, building_id, owner_id)
        if not building:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tòa nhà không tồn tại hoặc bạn không có quyền truy cập",
            )
        return building

    async def create_building(self, db: AsyncSession, owner_id: str, data: BuildingCreateSchema) -> Building:
        async with db.begin():
            building = Building(
                ownerId=owner_id,
                name=data.name.strip(),
                address=data.address.strip(),
                description=data.description,
                bankName=data.bankName,
                bankAccountNo=data.bankAccountNo,
                bankAccountName=data.bankAccountName,
                bankBin=data.bankBin,
                wifiInfo=data.wifiInfo,
                rules=data.rules,
            )
            await building_repo.create(db, building)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_BUILDING",
                entity="Building",
                entity_id=building.id,
                details=f"Khởi tạo tòa nhà {building.name}",
            )

        return building

    async def update_building(
        self, db: AsyncSession, owner_id: str, building_id: str, data: BuildingUpdateSchema
    ) -> Building:
        building = await self.get_building_detail(db, owner_id, building_id)

        async with db.begin():
            if data.name is not None:
                building.name = data.name.strip()
            if data.address is not None:
                building.address = data.address.strip()
            if data.description is not None:
                building.description = data.description
            if data.bankName is not None:
                building.bankName = data.bankName
            if data.bankAccountNo is not None:
                building.bankAccountNo = data.bankAccountNo
            if data.bankAccountName is not None:
                building.bankAccountName = data.bankAccountName
            if data.bankBin is not None:
                building.bankBin = data.bankBin
            if data.wifiInfo is not None:
                building.wifiInfo = data.wifiInfo
            if data.rules is not None:
                building.rules = data.rules

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_BUILDING",
                entity="Building",
                entity_id=building.id,
                details=f"Cập nhật thông tin tòa nhà {building.name}",
            )

        return building

    async def soft_delete_building(self, db: AsyncSession, owner_id: str, building_id: str) -> None:
        building = await self.get_building_detail(db, owner_id, building_id)

        # Check active contracts in building
        active_contracts = await building_repo.count_active_contracts(db, building_id)
        if active_contracts > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể lưu trữ tòa nhà {building.name} vì đang có {active_contracts} hợp đồng thuê đang hoạt động.",
            )

        async with db.begin():
            building.deletedAt = datetime.now()
            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="DELETE_BUILDING",
                entity="Building",
                entity_id=building.id,
                details=f"Lưu trữ tòa nhà {building.name}",
            )
