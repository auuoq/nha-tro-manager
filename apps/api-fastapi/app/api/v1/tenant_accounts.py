from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.tenant_account_service import TenantAccountService
from app.schemas.tenant_account import TenantAccountCreateResponseSchema, TempPasswordResponseSchema
from app.schemas.common import APIResponse

router = APIRouter(prefix="/tenants", tags=["Tenant Accounts"])
account_service = TenantAccountService()

@router.post("/{tenant_id}/account", response_model=APIResponse[TenantAccountCreateResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_tenant_account(
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await account_service.create_tenant_account(db, current_user.id, tenant_id)
    return APIResponse(
        success=True,
        data=result,
        message="Khởi tạo tài khoản người dùng cho khách thuê thành công",
    )

@router.post("/{tenant_id}/account/reset-password", response_model=APIResponse[TempPasswordResponseSchema])
async def reset_tenant_password(
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await account_service.reset_tenant_password(db, current_user.id, tenant_id)
    return APIResponse(
        success=True,
        data=result,
        message="Cấp lại mật khẩu tạm thời thành công",
    )

@router.post("/{tenant_id}/account/suspend", response_model=APIResponse[dict])
async def suspend_tenant_account(
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await account_service.suspend_tenant_account(db, current_user.id, tenant_id)
    return APIResponse(
        success=True,
        data={"tenantId": tenant_id},
        message="Tạm khóa tài khoản khách thuê thành công",
    )

@router.post("/{tenant_id}/account/reactivate", response_model=APIResponse[dict])
async def reactivate_tenant_account(
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await account_service.reactivate_tenant_account(db, current_user.id, tenant_id)
    return APIResponse(
        success=True,
        data={"tenantId": tenant_id},
        message="Mở khóa tài khoản khách thuê thành công",
    )
