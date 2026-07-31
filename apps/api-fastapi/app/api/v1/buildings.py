from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.building_service import BuildingService
from app.services.charge_config_service import ChargeConfigService
from app.schemas.building import BuildingCreateSchema, BuildingUpdateSchema, BuildingResponseSchema
from app.schemas.charge_config import ChargeConfigCreateSchema, ChargeConfigUpdateSchema, ChargeConfigResponseSchema
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/buildings", tags=["Buildings"])
building_service = BuildingService()
charge_config_service = ChargeConfigService()

@router.get("", response_model=APIResponse[PaginatedData[BuildingResponseSchema]])
async def get_buildings(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await building_service.get_buildings_by_owner(db, current_user.id, page, pageSize)
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    response_items = [
        BuildingResponseSchema(
            id=b.id,
            ownerId=b.ownerId,
            name=b.name,
            address=b.address,
            description=b.description,
            bankName=b.bankName,
            bankAccountNo=b.bankAccountNo,
            bankAccountName=b.bankAccountName,
            bankBin=b.bankBin,
            wifiInfo=b.wifiInfo,
            rules=b.rules,
            roomsCount=len(b.rooms) if b.rooms else 0,
            createdAt=b.createdAt,
            updatedAt=b.updatedAt,
        )
        for b in items
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
        message="Lấy danh sách tòa nhà thành công",
    )

@router.post("", response_model=APIResponse[BuildingResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_building(
    body: BuildingCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    building = await building_service.create_building(db, current_user.id, body)
    return APIResponse(
        success=True,
        data=BuildingResponseSchema(
            id=building.id,
            ownerId=building.ownerId,
            name=building.name,
            address=building.address,
            description=building.description,
            bankName=building.bankName,
            bankAccountNo=building.bankAccountNo,
            bankAccountName=building.bankAccountName,
            bankBin=building.bankBin,
            wifiInfo=building.wifiInfo,
            rules=building.rules,
            roomsCount=0,
            createdAt=building.createdAt,
            updatedAt=building.updatedAt,
        ),
        message="Tạo tòa nhà mới thành công",
    )

@router.get("/{building_id}", response_model=APIResponse[BuildingResponseSchema])
async def get_building_detail(
    building_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    building = await building_service.get_building_detail(db, current_user.id, building_id)
    return APIResponse(
        success=True,
        data=BuildingResponseSchema(
            id=building.id,
            ownerId=building.ownerId,
            name=building.name,
            address=building.address,
            description=building.description,
            bankName=building.bankName,
            bankAccountNo=building.bankAccountNo,
            bankAccountName=building.bankAccountName,
            bankBin=building.bankBin,
            wifiInfo=building.wifiInfo,
            rules=building.rules,
            roomsCount=len(building.rooms) if building.rooms else 0,
            createdAt=building.createdAt,
            updatedAt=building.updatedAt,
        ),
        message="Lấy thông tin chi tiết tòa nhà thành công",
    )

@router.patch("/{building_id}", response_model=APIResponse[BuildingResponseSchema])
async def update_building(
    building_id: str,
    body: BuildingUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    building = await building_service.update_building(db, current_user.id, building_id, body)
    return APIResponse(
        success=True,
        data=BuildingResponseSchema(
            id=building.id,
            ownerId=building.ownerId,
            name=building.name,
            address=building.address,
            description=building.description,
            bankName=building.bankName,
            bankAccountNo=building.bankAccountNo,
            bankAccountName=building.bankAccountName,
            bankBin=building.bankBin,
            wifiInfo=building.wifiInfo,
            rules=building.rules,
            roomsCount=len(building.rooms) if building.rooms else 0,
            createdAt=building.createdAt,
            updatedAt=building.updatedAt,
        ),
        message="Cập nhật tòa nhà thành công",
    )

@router.delete("/{building_id}", response_model=APIResponse[dict])
async def delete_building(
    building_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await building_service.soft_delete_building(db, current_user.id, building_id)
    return APIResponse(
        success=True,
        data={"buildingId": building_id},
        message="Lưu trữ tòa nhà thành công",
    )

# Building Charge Configs
@router.get("/{building_id}/charge-configs", response_model=APIResponse[List[ChargeConfigResponseSchema]])
async def get_building_charge_configs(
    building_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    configs = await charge_config_service.get_building_charge_configs(db, current_user.id, building_id)
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
        message="Lấy danh sách cấu hình chi phí tòa nhà thành công",
    )

@router.post("/{building_id}/charge-configs", response_model=APIResponse[ChargeConfigResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_building_charge_config(
    building_id: str,
    body: ChargeConfigCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    config = await charge_config_service.create_building_charge_config(db, current_user.id, building_id, body)
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
        message="Tạo cấu hình chi phí tòa nhà mới thành công",
    )

@router.patch("/{building_id}/charge-configs/{config_id}", response_model=APIResponse[ChargeConfigResponseSchema])
async def update_building_charge_config(
    building_id: str,
    config_id: str,
    body: ChargeConfigUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    config = await charge_config_service.update_building_charge_config(db, current_user.id, building_id, config_id, body)
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
        message="Cập nhật cấu hình chi phí tòa nhà thành công",
    )
