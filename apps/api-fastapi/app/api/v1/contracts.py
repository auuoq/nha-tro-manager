from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.models.enums import ContractStatus
from app.services.contract_service import ContractService
from app.services.contract_lifecycle_service import ContractLifecycleService
from app.services.charge_config_service import ChargeConfigService
from app.schemas.contract import (
    ContractCreateSchema,
    ContractUpdateSchema,
    ContractResponseSchema,
    ContractTerminateSchema,
    ContractCancelSchema,
)
from app.schemas.charge_config import ChargeConfigCreateSchema, ChargeConfigUpdateSchema, ChargeConfigResponseSchema
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/contracts", tags=["Contracts"])
contract_service = ContractService()
lifecycle_service = ContractLifecycleService()
charge_config_service = ChargeConfigService()

@router.get("", response_model=APIResponse[PaginatedData[ContractResponseSchema]])
async def get_contracts(
    buildingId: Optional[str] = Query(default=None, description="Lọc theo Tòa nhà"),
    roomId: Optional[str] = Query(default=None, description="Lọc theo Phòng trọ"),
    status: Optional[ContractStatus] = Query(default=None, description="Lọc theo Trạng thái"),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await contract_service.get_contracts_by_owner(
        db, current_user.id, building_id=buildingId, room_id=roomId, status_filter=status, page=page, page_size=pageSize
    )
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    response_items = [
        ContractResponseSchema(
            id=c.id,
            contractCode=c.contractCode,
            roomId=c.roomId,
            roomNumber=r_num,
            buildingName=b_name,
            startDate=c.startDate,
            endDate=c.endDate,
            actualEndDate=c.actualEndDate,
            monthlyPrice=c.monthlyPrice,
            depositAmount=c.depositAmount,
            returnedDeposit=c.returnedDeposit,
            depositDeductions=c.depositDeductions,
            billingDay=c.billingDay,
            paymentCycleMonths=c.paymentCycleMonths,
            status=c.status,
            terms=c.terms,
            cancellationReason=c.cancellationReason,
            terminationReason=c.terminationReason,
            createdAt=c.createdAt,
            updatedAt=c.updatedAt,
        )
        for c, r_num, b_name in items
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
        message="Lấy danh sách hợp đồng thành công",
    )

@router.post("", response_model=APIResponse[ContractResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_contract(
    body: ContractCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    contract = await contract_service.create_contract(db, current_user.id, body)
    return APIResponse(
        success=True,
        data=ContractResponseSchema(
            id=contract.id,
            contractCode=contract.contractCode,
            roomId=contract.roomId,
            roomNumber=contract.room.roomNumber if contract.room else None,
            buildingName=contract.room.building.name if contract.room and contract.room.building else None,
            startDate=contract.startDate,
            endDate=contract.endDate,
            actualEndDate=contract.actualEndDate,
            monthlyPrice=contract.monthlyPrice,
            depositAmount=contract.depositAmount,
            returnedDeposit=contract.returnedDeposit,
            depositDeductions=contract.depositDeductions,
            billingDay=contract.billingDay,
            paymentCycleMonths=contract.paymentCycleMonths,
            status=contract.status,
            terms=contract.terms,
            cancellationReason=contract.cancellationReason,
            terminationReason=contract.terminationReason,
            createdAt=contract.createdAt,
            updatedAt=contract.updatedAt,
        ),
        message="Tạo dự thảo hợp đồng mới thành công",
    )

@router.get("/{contract_id}", response_model=APIResponse[ContractResponseSchema])
async def get_contract_detail(
    contract_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    contract = await contract_service.get_contract_detail(db, current_user.id, contract_id)
    return APIResponse(
        success=True,
        data=ContractResponseSchema(
            id=contract.id,
            contractCode=contract.contractCode,
            roomId=contract.roomId,
            roomNumber=contract.room.roomNumber if contract.room else None,
            buildingName=contract.room.building.name if contract.room and contract.room.building else None,
            startDate=contract.startDate,
            endDate=contract.endDate,
            actualEndDate=contract.actualEndDate,
            monthlyPrice=contract.monthlyPrice,
            depositAmount=contract.depositAmount,
            returnedDeposit=contract.returnedDeposit,
            depositDeductions=contract.depositDeductions,
            billingDay=contract.billingDay,
            paymentCycleMonths=contract.paymentCycleMonths,
            status=contract.status,
            terms=contract.terms,
            cancellationReason=contract.cancellationReason,
            terminationReason=contract.terminationReason,
            createdAt=contract.createdAt,
            updatedAt=contract.updatedAt,
        ),
        message="Lấy chi tiết hợp đồng thành công",
    )

@router.patch("/{contract_id}", response_model=APIResponse[ContractResponseSchema])
async def update_contract(
    contract_id: str,
    body: ContractUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    contract = await contract_service.update_contract(db, current_user.id, contract_id, body)
    return APIResponse(
        success=True,
        data=ContractResponseSchema(
            id=contract.id,
            contractCode=contract.contractCode,
            roomId=contract.roomId,
            roomNumber=contract.room.roomNumber if contract.room else None,
            buildingName=contract.room.building.name if contract.room and contract.room.building else None,
            startDate=contract.startDate,
            endDate=contract.endDate,
            actualEndDate=contract.actualEndDate,
            monthlyPrice=contract.monthlyPrice,
            depositAmount=contract.depositAmount,
            returnedDeposit=contract.returnedDeposit,
            depositDeductions=contract.depositDeductions,
            billingDay=contract.billingDay,
            paymentCycleMonths=contract.paymentCycleMonths,
            status=contract.status,
            terms=contract.terms,
            cancellationReason=contract.cancellationReason,
            terminationReason=contract.terminationReason,
            createdAt=contract.createdAt,
            updatedAt=contract.updatedAt,
        ),
        message="Cập nhật hợp đồng thành công",
    )

@router.post("/{contract_id}/activate", response_model=APIResponse[ContractResponseSchema])
async def activate_contract(
    contract_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    contract = await lifecycle_service.activate_contract(db, current_user.id, contract_id)
    return APIResponse(
        success=True,
        data=ContractResponseSchema(
            id=contract.id,
            contractCode=contract.contractCode,
            roomId=contract.roomId,
            roomNumber=contract.room.roomNumber if contract.room else None,
            buildingName=contract.room.building.name if contract.room and contract.room.building else None,
            startDate=contract.startDate,
            endDate=contract.endDate,
            actualEndDate=contract.actualEndDate,
            monthlyPrice=contract.monthlyPrice,
            depositAmount=contract.depositAmount,
            returnedDeposit=contract.returnedDeposit,
            depositDeductions=contract.depositDeductions,
            billingDay=contract.billingDay,
            paymentCycleMonths=contract.paymentCycleMonths,
            status=contract.status,
            terms=contract.terms,
            cancellationReason=contract.cancellationReason,
            terminationReason=contract.terminationReason,
            createdAt=contract.createdAt,
            updatedAt=contract.updatedAt,
        ),
        message=f"Kích hoạt hợp đồng {contract.contractCode} thành công. Trạng thái phòng đã chuyển sang Đang cho thuê (RENTED)",
    )

@router.post("/{contract_id}/terminate", response_model=APIResponse[ContractResponseSchema])
async def terminate_contract(
    contract_id: str,
    body: ContractTerminateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    contract = await lifecycle_service.terminate_contract(db, current_user.id, contract_id, body)
    return APIResponse(
        success=True,
        data=ContractResponseSchema(
            id=contract.id,
            contractCode=contract.contractCode,
            roomId=contract.roomId,
            roomNumber=contract.room.roomNumber if contract.room else None,
            buildingName=contract.room.building.name if contract.room and contract.room.building else None,
            startDate=contract.startDate,
            endDate=contract.endDate,
            actualEndDate=contract.actualEndDate,
            monthlyPrice=contract.monthlyPrice,
            depositAmount=contract.depositAmount,
            returnedDeposit=contract.returnedDeposit,
            depositDeductions=contract.depositDeductions,
            billingDay=contract.billingDay,
            paymentCycleMonths=contract.paymentCycleMonths,
            status=contract.status,
            terms=contract.terms,
            cancellationReason=contract.cancellationReason,
            terminationReason=contract.terminationReason,
            createdAt=contract.createdAt,
            updatedAt=contract.updatedAt,
        ),
        message=f"Thanh lý hợp đồng {contract.contractCode} thành công",
    )

@router.post("/{contract_id}/cancel", response_model=APIResponse[ContractResponseSchema])
async def cancel_contract(
    contract_id: str,
    body: ContractCancelSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    contract = await lifecycle_service.cancel_contract(db, current_user.id, contract_id, body)
    return APIResponse(
        success=True,
        data=ContractResponseSchema(
            id=contract.id,
            contractCode=contract.contractCode,
            roomId=contract.roomId,
            roomNumber=contract.room.roomNumber if contract.room else None,
            buildingName=contract.room.building.name if contract.room and contract.room.building else None,
            startDate=contract.startDate,
            endDate=contract.endDate,
            actualEndDate=contract.actualEndDate,
            monthlyPrice=contract.monthlyPrice,
            depositAmount=contract.depositAmount,
            returnedDeposit=contract.returnedDeposit,
            depositDeductions=contract.depositDeductions,
            billingDay=contract.billingDay,
            paymentCycleMonths=contract.paymentCycleMonths,
            status=contract.status,
            terms=contract.terms,
            cancellationReason=contract.cancellationReason,
            terminationReason=contract.terminationReason,
            createdAt=contract.createdAt,
            updatedAt=contract.updatedAt,
        ),
        message=f"Hủy dự thảo hợp đồng {contract.contractCode} thành công",
    )

# Contract Charge Configs
@router.get("/{contract_id}/charge-configs", response_model=APIResponse[List[ChargeConfigResponseSchema]])
async def get_contract_charge_configs(
    contract_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    configs = await charge_config_service.get_contract_charge_configs(db, current_user.id, contract_id)
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
        message="Lấy danh sách cấu hình chi phí hợp đồng thành công",
    )

@router.post("/{contract_id}/charge-configs", response_model=APIResponse[ChargeConfigResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_contract_charge_config(
    contract_id: str,
    body: ChargeConfigCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    config = await charge_config_service.create_contract_charge_config(db, current_user.id, contract_id, body)
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
        message="Tạo cấu hình chi phí hợp đồng mới thành công",
    )

@router.patch("/{contract_id}/charge-configs/{config_id}", response_model=APIResponse[ChargeConfigResponseSchema])
async def update_contract_charge_config(
    contract_id: str,
    config_id: str,
    body: ChargeConfigUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    config = await charge_config_service.update_contract_charge_config(db, current_user.id, contract_id, config_id, body)
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
        message="Cập nhật cấu hình chi phí hợp đồng thành công",
    )
