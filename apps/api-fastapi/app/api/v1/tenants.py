from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.tenant_service import TenantService
from app.schemas.tenant import TenantCreateSchema, TenantUpdateSchema, TenantResponseSchema
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/tenants", tags=["Tenants"])
tenant_service = TenantService()

@router.get("", response_model=APIResponse[PaginatedData[TenantResponseSchema]])
async def get_tenants(
    search: Optional[str] = Query(default=None, description="Tìm kiếm theo tên, SĐT, số CCCD"),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await tenant_service.get_tenants_by_owner(db, current_user.id, search=search, page=page, page_size=pageSize)
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    response_items = [
        TenantResponseSchema(
            id=t.id,
            ownerId=t.ownerId,
            userId=t.userId,
            fullName=t.fullName,
            phone=t.phone,
            idCardNumber=t.idCardNumber,
            idCardIssuedDate=t.idCardIssuedDate,
            idCardIssuedPlace=t.idCardIssuedPlace,
            dateOfBirth=t.dateOfBirth,
            gender=t.gender,
            permanentAddress=t.permanentAddress,
            vehicleNumber=t.vehicleNumber,
            emergencyContactName=t.emergencyContactName,
            emergencyContactPhone=t.emergencyContactPhone,
            hasAccount=t.userId is not None or t.user is not None,
            isAccountActive=t.user.isActive if t.user else True,
            createdAt=t.createdAt,
            updatedAt=t.updatedAt,
        )
        for t in items
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
        message="Lấy danh sách khách thuê thành công",
    )

@router.post("", response_model=APIResponse[TenantResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_tenant(
    body: TenantCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.create_tenant(db, current_user.id, body)
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
            hasAccount=False,
            isAccountActive=True,
            createdAt=tenant.createdAt,
            updatedAt=tenant.updatedAt,
        ),
        message="Tạo thông tin khách thuê mới thành công",
    )

@router.get("/{tenant_id}", response_model=APIResponse[TenantResponseSchema])
async def get_tenant_detail(
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_detail(db, current_user.id, tenant_id)
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
            hasAccount=tenant.userId is not None or t.user is not None if hasattr(tenant, 'user') else False,
            isAccountActive=tenant.user.isActive if hasattr(tenant, 'user') and tenant.user else True,
            createdAt=tenant.createdAt,
            updatedAt=tenant.updatedAt,
        ),
        message="Lấy thông tin chi tiết khách thuê thành công",
    )

@router.patch("/{tenant_id}", response_model=APIResponse[TenantResponseSchema])
async def update_tenant(
    tenant_id: str,
    body: TenantUpdateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.update_tenant(db, current_user.id, tenant_id, body)
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
            hasAccount=tenant.userId is not None,
            isAccountActive=tenant.user.isActive if hasattr(tenant, 'user') and tenant.user else True,
            createdAt=tenant.createdAt,
            updatedAt=tenant.updatedAt,
        ),
        message="Cập nhật thông tin khách thuê thành công",
    )

@router.delete("/{tenant_id}", response_model=APIResponse[dict])
async def delete_tenant(
    tenant_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    await tenant_service.soft_delete_tenant(db, current_user.id, tenant_id)
    return APIResponse(
        success=True,
        data={"tenantId": tenant_id},
        message="Lưu trữ sơ yếu lý lịch khách thuê thành công",
    )
