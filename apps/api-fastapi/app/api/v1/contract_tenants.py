from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.contract_tenant_service import ContractTenantService
from app.schemas.contract_tenant import (
    ContractTenantCreateSchema,
    ContractTenantResponseSchema,
    ChangePrimaryTenantSchema,
)
from app.schemas.common import APIResponse

router = APIRouter(prefix="/contracts", tags=["Contract Tenants"])
ct_service = ContractTenantService()

@router.get("/{contract_id}/tenants", response_model=APIResponse[List[ContractTenantResponseSchema]])
async def get_contract_tenants(
    contract_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items = await ct_service.get_contract_tenants(db, current_user.id, contract_id)
    return APIResponse(
        success=True,
        data=[
            ContractTenantResponseSchema(
                id=ct.id,
                contractId=ct.contractId,
                tenantId=ct.tenantId,
                tenantName=ct.tenant.fullName if ct.tenant else None,
                tenantPhone=ct.tenant.phone if ct.tenant else None,
                role=ct.role,
                joinedAt=ct.joinedAt,
                leftAt=ct.leftAt,
                createdAt=ct.createdAt,
            )
            for ct in items
        ],
        message="Lấy danh sách khách thuê thuộc hợp đồng thành công",
    )

@router.post("/{contract_id}/tenants", response_model=APIResponse[ContractTenantResponseSchema], status_code=status.HTTP_201_CREATED)
async def add_tenant_to_contract(
    contract_id: str,
    body: ContractTenantCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    ct = await ct_service.add_tenant_to_contract(db, current_user.id, contract_id, body)
    return APIResponse(
        success=True,
        data=ContractTenantResponseSchema(
            id=ct.id,
            contractId=ct.contractId,
            tenantId=ct.tenantId,
            tenantName=ct.tenant.fullName if ct.tenant else None,
            tenantPhone=ct.tenant.phone if ct.tenant else None,
            role=ct.role,
            joinedAt=ct.joinedAt,
            leftAt=ct.leftAt,
            createdAt=ct.createdAt,
        ),
        message="Thêm khách thuê vào hợp đồng thành công",
    )

@router.delete("/{contract_id}/tenants/{tenant_id}", response_model=APIResponse[dict])
async def remove_tenant_from_contract(
    contract_id: str,
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await ct_service.remove_tenant_from_contract(db, current_user.id, contract_id, tenant_id)
    return APIResponse(
        success=True,
        data={"contractId": contract_id, "tenantId": tenant_id},
        message="Ghi nhận khách thuê rời khỏi hợp đồng thành công",
    )

@router.post("/{contract_id}/change-primary", response_model=APIResponse[dict])
async def change_primary_tenant(
    contract_id: str,
    body: ChangePrimaryTenantSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await ct_service.change_primary_tenant(db, current_user.id, contract_id, body)
    return APIResponse(
        success=True,
        data={"contractId": contract_id, "newPrimaryTenantId": body.newPrimaryTenantId},
        message="Đổi khách thuê đại diện (PRIMARY) thành công",
    )
