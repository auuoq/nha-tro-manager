import secrets
from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.tenant_repository import TenantRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.tenant import Tenant
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.tenant import TenantCreateSchema, TenantUpdateSchema, TenantSelfProfileUpdateSchema
from app.core.exceptions import BusinessException
from app.core.security import hash_password

tenant_repo = TenantRepository()

class TenantService:
    async def get_tenants_by_owner(
        self, db: AsyncSession, owner_id: str, search: Optional[str] = None, page: int = 1, page_size: int = 20
    ) -> Tuple[List[Tenant], int]:
        return await tenant_repo.get_all_by_owner(db, owner_id, search=search, page=page, page_size=page_size)

    async def get_tenant_detail(self, db: AsyncSession, owner_id: str, tenant_id: str) -> Tenant:
        tenant = await tenant_repo.get_by_id(db, tenant_id, owner_id)
        if not tenant:
            raise BusinessException(
                code="TENANT_NOT_FOUND",
                message="Thông tin khách thuê không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return tenant

    async def create_tenant(self, db: AsyncSession, owner_id: str, data: TenantCreateSchema) -> Tenant:
        # Check duplicate idCardNumber under same owner
        existing = await tenant_repo.get_by_id_card(db, owner_id, data.idCardNumber)
        if existing:
            raise BusinessException(
                code="TENANT_IDCARD_EXISTS",
                message=f"Khách thuê có số CCCD/CMND {data.idCardNumber} đã tồn tại trong hệ thống của bạn",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            tenant = Tenant(
                ownerId=owner_id,
                fullName=data.fullName.strip(),
                phone=data.phone.strip(),
                email=data.email,
                idCardNumber=data.idCardNumber.strip(),
                idCardIssuedDate=data.idCardIssuedDate,
                idCardIssuedPlace=data.idCardIssuedPlace,
                dateOfBirth=data.dateOfBirth,
                gender=data.gender,
                permanentAddress=data.permanentAddress,
                vehicleNumber=data.vehicleNumber,
                emergencyContactName=data.emergencyContactName,
                emergencyContactPhone=data.emergencyContactPhone,
                notes=data.notes,
            )
            await tenant_repo.create(db, tenant)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_TENANT",
                entity="Tenant",
                entity_id=tenant.id,
                details=f"Tạo sơ yếu lý lịch khách thuê {tenant.fullName}",
            )

        return tenant

    async def update_tenant(
        self, db: AsyncSession, owner_id: str, tenant_id: str, data: TenantUpdateSchema
    ) -> Tenant:
        tenant = await self.get_tenant_detail(db, owner_id, tenant_id)

        # Check duplicate idCardNumber if changing
        if data.idCardNumber and data.idCardNumber.strip() != tenant.idCardNumber:
            existing = await tenant_repo.get_by_id_card(db, owner_id, data.idCardNumber)
            if existing:
                raise BusinessException(
                    code="TENANT_IDCARD_EXISTS",
                    message=f"Khách thuê có số CCCD/CMND {data.idCardNumber} đã tồn tại trong hệ thống",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        async with db.begin():
            if data.fullName is not None:
                tenant.fullName = data.fullName.strip()
            if data.phone is not None:
                tenant.phone = data.phone.strip()
            if data.email is not None:
                tenant.email = data.email
            if data.idCardNumber is not None:
                tenant.idCardNumber = data.idCardNumber.strip()
            if data.idCardIssuedDate is not None:
                tenant.idCardIssuedDate = data.idCardIssuedDate
            if data.idCardIssuedPlace is not None:
                tenant.idCardIssuedPlace = data.idCardIssuedPlace
            if data.dateOfBirth is not None:
                tenant.dateOfBirth = data.dateOfBirth
            if data.gender is not None:
                tenant.gender = data.gender
            if data.permanentAddress is not None:
                tenant.permanentAddress = data.permanentAddress
            if data.vehicleNumber is not None:
                tenant.vehicleNumber = data.vehicleNumber
            if data.emergencyContactName is not None:
                tenant.emergencyContactName = data.emergencyContactName
            if data.emergencyContactPhone is not None:
                tenant.emergencyContactPhone = data.emergencyContactPhone
            if data.notes is not None:
                tenant.notes = data.notes

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="UPDATE_TENANT",
                entity="Tenant",
                entity_id=tenant.id,
                details=f"Cập nhật hồ sơ khách thuê {tenant.fullName}",
            )

        return tenant

    async def soft_delete_tenant(self, db: AsyncSession, owner_id: str, tenant_id: str) -> None:
        tenant = await self.get_tenant_detail(db, owner_id, tenant_id)

        # Check active contracts
        active_contracts = await tenant_repo.count_active_contracts(db, tenant_id)
        if active_contracts > 0:
            raise BusinessException(
                code="TENANT_HAS_ACTIVE_CONTRACT",
                message=f"Không thể lưu trữ khách thuê {tenant.fullName} vì đang tham gia {active_contracts} hợp đồng thuê đang hoạt động",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            tenant.deletedAt = datetime.now()

            # If tenant has user account, disable user and increment tokenVersion
            if tenant.user:
                tenant.user.isActive = False
                tenant.user.tokenVersion += 1

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="DELETE_TENANT",
                entity="Tenant",
                entity_id=tenant.id,
                details=f"Lưu trữ hồ sơ khách thuê {tenant.fullName}",
            )

    async def get_tenant_self_profile(self, db: AsyncSession, current_user: User) -> Tenant:
        tenant = await tenant_repo.get_by_user_id(db, current_user.id)
        if not tenant:
            raise BusinessException(
                code="TENANT_PROFILE_NOT_FOUND",
                message="Hồ sơ khách thuê cá nhân không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return tenant

    async def update_tenant_self_profile(
        self, db: AsyncSession, current_user: User, data: TenantSelfProfileUpdateSchema
    ) -> Tenant:
        tenant = await self.get_tenant_self_profile(db, current_user)

        async with db.begin():
            if data.phone is not None:
                tenant.phone = data.phone.strip()
            if data.permanentAddress is not None:
                tenant.permanentAddress = data.permanentAddress
            if data.vehicleNumber is not None:
                tenant.vehicleNumber = data.vehicleNumber
            if data.emergencyContactName is not None:
                tenant.emergencyContactName = data.emergencyContactName
            if data.emergencyContactPhone is not None:
                tenant.emergencyContactPhone = data.emergencyContactPhone

            await create_audit_log(
                db=db,
                user_id=current_user.id,
                action="UPDATE_TENANT_SELF_PROFILE",
                entity="Tenant",
                entity_id=tenant.id,
                details=f"Khách thuê {tenant.fullName} tự cập nhật hồ sơ cá nhân",
            )

        return tenant
