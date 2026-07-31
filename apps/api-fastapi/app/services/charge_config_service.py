from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.repositories.charge_config_repository import ChargeConfigRepository
from app.repositories.building_repository import BuildingRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.contract_repository import ContractRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.charge_config import ChargeConfig
from app.schemas.charge_config import ChargeConfigCreateSchema, ChargeConfigUpdateSchema
from app.core.exceptions import BusinessException

config_repo = ChargeConfigRepository()
building_repo = BuildingRepository()
room_repo = RoomRepository()
contract_repo = ContractRepository()

class ChargeConfigService:
    async def get_building_charge_configs(
        self, db: AsyncSession, owner_id: str, building_id: str
    ) -> List[ChargeConfig]:
        building = await building_repo.get_by_id(db, building_id, owner_id)
        if not building:
            raise BusinessException(
                code="BUILDING_NOT_FOUND",
                message="Tòa nhà không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return await config_repo.get_by_building(db, building_id)

    async def create_building_charge_config(
        self, db: AsyncSession, owner_id: str, building_id: str, data: ChargeConfigCreateSchema
    ) -> ChargeConfig:
        building = await building_repo.get_by_id(db, building_id, owner_id)
        if not building:
            raise BusinessException(
                code="BUILDING_NOT_FOUND",
                message="Tòa nhà không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        overlaps = await config_repo.find_overlapping(
            db=db,
            charge_type=data.chargeType,
            effective_from=data.effectiveFrom,
            effective_to=data.effectiveTo,
            building_id=building_id,
        )
        if overlaps:
            raise BusinessException(
                code="CHARGE_CONFIG_OVERLAP",
                message=f"Cấu hình chi phí loại {data.chargeType.value} bị trùng lặp khoảng thời gian áp dụng.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            config = ChargeConfig(
                buildingId=building_id,
                roomId=None,
                contractId=None,
                chargeType=data.chargeType,
                chargeMethod=data.chargeMethod,
                unitPrice=data.unitPrice,
                effectiveFrom=data.effectiveFrom,
                effectiveTo=data.effectiveTo,
            )
            await config_repo.create(db, config)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_BUILDING_CHARGE_CONFIG",
                entity="ChargeConfig",
                entity_id=config.id,
                details=f"Tạo cấu hình chi phí {config.chargeType.value} cho tòa nhà {building.name}",
            )

        return config

    async def update_building_charge_config(
        self, db: AsyncSession, owner_id: str, building_id: str, config_id: str, data: ChargeConfigUpdateSchema
    ) -> ChargeConfig:
        building = await building_repo.get_by_id(db, building_id, owner_id)
        if not building:
            raise BusinessException(
                code="BUILDING_NOT_FOUND",
                message="Tòa nhà không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        config = await config_repo.get_by_id(db, config_id)
        if not config or config.buildingId != building_id:
            raise BusinessException(
                code="CHARGE_CONFIG_NOT_FOUND",
                message="Cấu hình chi phí không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        effective_from = data.effectiveFrom if data.effectiveFrom is not None else config.effectiveFrom
        effective_to = data.effectiveTo if data.effectiveTo is not None else config.effectiveTo

        overlaps = await config_repo.find_overlapping(
            db=db,
            charge_type=config.chargeType,
            effective_from=effective_from,
            effective_to=effective_to,
            building_id=building_id,
            exclude_id=config_id,
        )
        if overlaps:
            raise BusinessException(
                code="CHARGE_CONFIG_OVERLAP",
                message="Cấu hình chi phí bị trùng lặp khoảng thời gian áp dụng với cấu hình khác.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            if data.chargeMethod is not None:
                config.chargeMethod = data.chargeMethod
            if data.unitPrice is not None:
                config.unitPrice = data.unitPrice
            if data.effectiveFrom is not None:
                config.effectiveFrom = data.effectiveFrom
            if data.effectiveTo is not None:
                config.effectiveTo = data.effectiveTo

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_BUILDING_CHARGE_CONFIG",
                entity="ChargeConfig",
                entity_id=config.id,
                details=f"Cập nhật cấu hình chi phí {config.chargeType.value} cho tòa nhà {building.name}",
            )

        return config

    async def get_room_charge_configs(self, db: AsyncSession, owner_id: str, room_id: str) -> List[ChargeConfig]:
        room = await room_repo.get_by_id(db, room_id, owner_id)
        if not room:
            raise BusinessException(
                code="ROOM_NOT_FOUND",
                message="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return await config_repo.get_by_room(db, room_id)

    async def create_room_charge_config(
        self, db: AsyncSession, owner_id: str, room_id: str, data: ChargeConfigCreateSchema
    ) -> ChargeConfig:
        room = await room_repo.get_by_id(db, room_id, owner_id)
        if not room:
            raise BusinessException(
                code="ROOM_NOT_FOUND",
                message="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        overlaps = await config_repo.find_overlapping(
            db=db,
            charge_type=data.chargeType,
            effective_from=data.effectiveFrom,
            effective_to=data.effectiveTo,
            room_id=room_id,
        )
        if overlaps:
            raise BusinessException(
                code="CHARGE_CONFIG_OVERLAP",
                message=f"Cấu hình chi phí loại {data.chargeType.value} bị trùng lặp khoảng thời gian áp dụng.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            config = ChargeConfig(
                buildingId=None,
                roomId=room_id,
                contractId=None,
                chargeType=data.chargeType,
                chargeMethod=data.chargeMethod,
                unitPrice=data.unitPrice,
                effectiveFrom=data.effectiveFrom,
                effectiveTo=data.effectiveTo,
            )
            await config_repo.create(db, config)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_ROOM_CHARGE_CONFIG",
                entity="ChargeConfig",
                entity_id=config.id,
                details=f"Tạo cấu hình chi phí {config.chargeType.value} riêng cho phòng {room.roomNumber}",
            )

        return config

    async def update_room_charge_config(
        self, db: AsyncSession, owner_id: str, room_id: str, config_id: str, data: ChargeConfigUpdateSchema
    ) -> ChargeConfig:
        room = await room_repo.get_by_id(db, room_id, owner_id)
        if not room:
            raise BusinessException(
                code="ROOM_NOT_FOUND",
                message="Phòng trọ không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        config = await config_repo.get_by_id(db, config_id)
        if not config or config.roomId != room_id:
            raise BusinessException(
                code="CHARGE_CONFIG_NOT_FOUND",
                message="Cấu hình chi phí riêng cho phòng không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        effective_from = data.effectiveFrom if data.effectiveFrom is not None else config.effectiveFrom
        effective_to = data.effectiveTo if data.effectiveTo is not None else config.effectiveTo

        overlaps = await config_repo.find_overlapping(
            db=db,
            charge_type=config.chargeType,
            effective_from=effective_from,
            effective_to=effective_to,
            room_id=room_id,
            exclude_id=config_id,
        )
        if overlaps:
            raise BusinessException(
                code="CHARGE_CONFIG_OVERLAP",
                message="Cấu hình chi phí bị trùng lặp khoảng thời gian áp dụng.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            if data.chargeMethod is not None:
                config.chargeMethod = data.chargeMethod
            if data.unitPrice is not None:
                config.unitPrice = data.unitPrice
            if data.effectiveFrom is not None:
                config.effectiveFrom = data.effectiveFrom
            if data.effectiveTo is not None:
                config.effectiveTo = data.effectiveTo

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_ROOM_CHARGE_CONFIG",
                entity="ChargeConfig",
                entity_id=config.id,
                details=f"Cập nhật cấu hình chi phí riêng cho phòng {room.roomNumber}",
            )

        return config

    # Contract Charge Configs
    async def get_contract_charge_configs(
        self, db: AsyncSession, owner_id: str, contract_id: str
    ) -> List[ChargeConfig]:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(
                code="CONTRACT_NOT_FOUND",
                message="Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        stmt = (
            select(ChargeConfig)
            .where(
                ChargeConfig.contractId == contract_id,
                ChargeConfig.roomId.is_(None),
                ChargeConfig.buildingId.is_(None),
            )
            .order_by(ChargeConfig.chargeType.asc(), ChargeConfig.effectiveFrom.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create_contract_charge_config(
        self, db: AsyncSession, owner_id: str, contract_id: str, data: ChargeConfigCreateSchema
    ) -> ChargeConfig:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(
                code="CONTRACT_NOT_FOUND",
                message="Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Overlap check
        stmt = select(ChargeConfig).where(
            ChargeConfig.contractId == contract_id,
            ChargeConfig.chargeType == data.chargeType,
            ChargeConfig.roomId.is_(None),
            ChargeConfig.buildingId.is_(None),
        )
        res = await db.execute(stmt)
        existing_configs = list(res.scalars().all())
        for c in existing_configs:
            c_to = c.effectiveTo
            if data.effectiveTo:
                if c.effectiveFrom <= data.effectiveTo and (c_to is None or c_to >= data.effectiveFrom):
                    raise BusinessException(
                        code="CHARGE_CONFIG_OVERLAP",
                        message=f"Cấu hình chi phí hợp đồng loại {data.chargeType.value} bị trùng lặp thời gian áp dụng.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                if c_to is None or c_to >= data.effectiveFrom:
                    raise BusinessException(
                        code="CHARGE_CONFIG_OVERLAP",
                        message=f"Cấu hình chi phí hợp đồng loại {data.chargeType.value} bị trùng lặp thời gian áp dụng.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )

        async with db.begin():
            config = ChargeConfig(
                buildingId=None,
                roomId=None,
                contractId=contract_id,
                chargeType=data.chargeType,
                chargeMethod=data.chargeMethod,
                unitPrice=data.unitPrice,
                effectiveFrom=data.effectiveFrom,
                effectiveTo=data.effectiveTo,
            )
            await config_repo.create(db, config)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_CONTRACT_CHARGE_CONFIG",
                entity="ChargeConfig",
                entity_id=config.id,
                details=f"Tạo cấu hình chi phí {config.chargeType.value} theo hợp đồng {contract.contractCode}",
            )

        return config

    async def update_contract_charge_config(
        self, db: AsyncSession, owner_id: str, contract_id: str, config_id: str, data: ChargeConfigUpdateSchema
    ) -> ChargeConfig:
        contract = await contract_repo.get_by_id(db, contract_id, owner_id)
        if not contract:
            raise BusinessException(
                code="CONTRACT_NOT_FOUND",
                message="Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        config = await config_repo.get_by_id(db, config_id)
        if not config or config.contractId != contract_id:
            raise BusinessException(
                code="CHARGE_CONFIG_NOT_FOUND",
                message="Cấu hình chi phí theo hợp đồng không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        async with db.begin():
            if data.chargeMethod is not None:
                config.chargeMethod = data.chargeMethod
            if data.unitPrice is not None:
                config.unitPrice = data.unitPrice
            if data.effectiveFrom is not None:
                config.effectiveFrom = data.effectiveFrom
            if data.effectiveTo is not None:
                config.effectiveTo = data.effectiveTo

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_CONTRACT_CHARGE_CONFIG",
                entity="ChargeConfig",
                entity_id=config.id,
                details=f"Cập nhật cấu hình chi phí hợp đồng {contract.contractCode}",
            )

        return config
