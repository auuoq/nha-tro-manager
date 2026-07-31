from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_tenant
from app.models.user import User
from app.services.tenant_service import TenantService
from app.repositories.contract_repository import ContractRepository
from app.repositories.contract_tenant_repository import ContractTenantRepository
from app.schemas.tenant import TenantSelfProfileUpdateSchema, TenantResponseSchema
from app.schemas.contract import ContractResponseSchema
from app.schemas.common import APIResponse
from app.core.exceptions import BusinessException

router = APIRouter(prefix="/tenant", tags=["Tenant Self Service"])
tenant_service = TenantService()
contract_repo = ContractRepository()
contract_tenant_repo = ContractTenantRepository()

@router.get("/profile", response_model=APIResponse[TenantResponseSchema])
async def get_tenant_profile(
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_self_profile(db, current_user)
    return APIResponse(
        success=True,
        data=TenantResponseSchema(
            id=tenant.id,
            ownerId=tenant.ownerId,
            userId=tenant.userId,
            fullName=tenant.fullName,
            phone=tenant.phone,
            idCardNumber=tenant.idCardNumber,
            idCardIssuedDate=tenant.idCardIssuedDate,
            idCardIssuedPlace=tenant.idCardIssuedPlace,
            dateOfBirth=tenant.dateOfBirth,
            gender=tenant.gender,
            permanentAddress=tenant.permanentAddress,
            vehicleNumber=tenant.vehicleNumber,
            emergencyContactName=tenant.emergencyContactName,
            emergencyContactPhone=tenant.emergencyContactPhone,
            hasAccount=True,
            isAccountActive=current_user.isActive,
            createdAt=tenant.createdAt,
            updatedAt=tenant.updatedAt,
        ),
        message="Lấy thông tin cá nhân khách thuê thành công",
    )

@router.patch("/profile", response_model=APIResponse[TenantResponseSchema])
async def update_tenant_profile(
    body: TenantSelfProfileUpdateSchema,
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.update_tenant_self_profile(db, current_user, body)
    return APIResponse(
        success=True,
        data=TenantResponseSchema(
            id=tenant.id,
            ownerId=tenant.ownerId,
            userId=tenant.userId,
            fullName=tenant.fullName,
            phone=tenant.phone,
            idCardNumber=tenant.idCardNumber,
            idCardIssuedDate=tenant.idCardIssuedDate,
            idCardIssuedPlace=tenant.idCardIssuedPlace,
            dateOfBirth=tenant.dateOfBirth,
            gender=tenant.gender,
            permanentAddress=tenant.permanentAddress,
            vehicleNumber=tenant.vehicleNumber,
            emergencyContactName=tenant.emergencyContactName,
            emergencyContactPhone=tenant.emergencyContactPhone,
            hasAccount=True,
            isAccountActive=current_user.isActive,
            createdAt=tenant.createdAt,
            updatedAt=tenant.updatedAt,
        ),
        message="Cập nhật thông tin cá nhân thành công",
    )

@router.get("/contracts/current", response_model=APIResponse[List[ContractResponseSchema]])
async def get_tenant_current_contracts(
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_self_profile(db, current_user)
    contracts = await contract_repo.get_tenant_active_contracts(db, tenant.id)
    return APIResponse(
        success=True,
        data=[
            ContractResponseSchema(
                id=c.id,
                contractCode=c.contractCode,
                roomId=c.roomId,
                roomNumber=c.room.roomNumber if c.room else None,
                buildingName=c.room.building.name if c.room and c.room.building else None,
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
            for c in contracts
        ],
        message="Lấy danh sách hợp đồng đang thuê thành công",
    )

@router.get("/contracts/{contract_id}", response_model=APIResponse[ContractResponseSchema])
async def get_tenant_contract_detail(
    contract_id: str,
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_self_profile(db, current_user)
    relation = await contract_tenant_repo.get_by_contract_and_tenant(db, contract_id, tenant.id)
    if not relation or relation.leftAt is not None:
        raise BusinessException(
            code="FORBIDDEN_RESOURCE_ACCESS",
            message="Bạn không có quyền xem thông tin chi tiết hợp đồng này",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    contract = await contract_repo.get_by_id(db, contract_id)
    if not contract:
        raise BusinessException(code="CONTRACT_NOT_FOUND", message="Hợp đồng không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

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
