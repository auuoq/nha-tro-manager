import secrets
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.tenant_repository import TenantRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.tenant import Tenant
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.tenant_account import TenantAccountCreateResponseSchema, TempPasswordResponseSchema
from app.core.exceptions import BusinessException
from app.core.security import hash_password

tenant_repo = TenantRepository()

def generate_strong_temp_password(length: int = 10) -> str:
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))

class TenantAccountService:
    async def create_tenant_account(
        self, db: AsyncSession, owner_id: str, tenant_id: str
    ) -> TenantAccountCreateResponseSchema:
        tenant = await tenant_repo.get_by_id(db, tenant_id, owner_id)
        if not tenant:
            raise BusinessException(
                code="TENANT_NOT_FOUND",
                message="Khách thuê không tồn tại hoặc không thuộc quyền quản lý của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if tenant.userId is not None or tenant.user is not None:
            raise BusinessException(
                code="TENANT_ACCOUNT_ALREADY_EXISTS",
                message=f"Khách thuê {tenant.fullName} đã có tài khoản người dùng trong hệ thống",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Check phone uniqueness on User model
        stmt = select(User).where(User.phone == tenant.phone, User.deletedAt.is_(None))
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise BusinessException(
                code="PHONE_ALREADY_IN_USE",
                message=f"Số điện thoại {tenant.phone} đã được đăng ký tài khoản bởi người dùng khác",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        temp_password = generate_strong_temp_password()
        hashed_pwd = hash_password(temp_password)

        async with db.begin():
            user = User(
                phone=tenant.phone,
                email=tenant.email,
                passwordHash=hashed_pwd,
                fullName=tenant.fullName,
                role=UserRole.TENANT,
                isActive=True,
                mustChangePassword=True,
                tokenVersion=1,
            )
            db.add(user)
            await db.flush()

            tenant.userId = user.id

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_TENANT_ACCOUNT",
                entity="User",
                entity_id=user.id,
                details=f"Cấp tài khoản truy cập ứng dụng cho khách thuê {tenant.fullName}",
            )

        return TenantAccountCreateResponseSchema(
            tenantId=tenant.id,
            userId=user.id,
            phone=user.phone,
            tempPassword=temp_password,
            mustChangePassword=True,
        )

    async def reset_tenant_password(
        self, db: AsyncSession, owner_id: str, tenant_id: str
    ) -> TempPasswordResponseSchema:
        tenant = await tenant_repo.get_by_id(db, tenant_id, owner_id)
        if not tenant or not tenant.user:
            raise BusinessException(
                code="TENANT_ACCOUNT_NOT_FOUND",
                message="Tài khoản khách thuê không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        temp_password = generate_strong_temp_password()
        hashed_pwd = hash_password(temp_password)

        async with db.begin():
            user = tenant.user
            user.passwordHash = hashed_pwd
            user.mustChangePassword = True
            user.tokenVersion += 1  # Invalidate all prior sessions

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="RESET_TENANT_PASSWORD",
                entity="User",
                entity_id=user.id,
                details=f"Cấp lại mật khẩu tạm thời cho khách thuê {tenant.fullName}",
            )

        return TempPasswordResponseSchema(
            tenantId=tenant.id,
            userId=user.id,
            tempPassword=temp_password,
        )

    async def suspend_tenant_account(self, db: AsyncSession, owner_id: str, tenant_id: str) -> None:
        tenant = await tenant_repo.get_by_id(db, tenant_id, owner_id)
        if not tenant or not tenant.user:
            raise BusinessException(
                code="TENANT_ACCOUNT_NOT_FOUND",
                message="Tài khoản khách thuê không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        async with db.begin():
            user = tenant.user
            user.isActive = False
            user.tokenVersion += 1  # Invalidate sessions

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="SUSPEND_TENANT_ACCOUNT",
                entity="User",
                entity_id=user.id,
                details=f"Tạm khóa tài khoản ứng dụng của khách thuê {tenant.fullName}",
            )

    async def reactivate_tenant_account(self, db: AsyncSession, owner_id: str, tenant_id: str) -> None:
        tenant = await tenant_repo.get_by_id(db, tenant_id, owner_id)
        if not tenant or not tenant.user:
            raise BusinessException(
                code="TENANT_ACCOUNT_NOT_FOUND",
                message="Tài khoản khách thuê không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        async with db.begin():
            user = tenant.user
            user.isActive = True

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="REACTIVATE_TENANT_ACCOUNT",
                entity="User",
                entity_id=user.id,
                details=f"Mở khóa lại tài khoản ứng dụng cho khách thuê {tenant.fullName}",
            )
