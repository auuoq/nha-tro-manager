from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from app.db.session import get_db
from app.schemas.common import APIResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=APIResponse[dict])
async def health_liveness():
    """Liveness probe: Checks if the FastAPI application is alive without querying the database."""
    return APIResponse(
        success=True,
        data={
            "status": "OK",
            "service": "Nha Tro Manager FastAPI Backend",
        },
        message="Dịch vụ hoạt động bình thường",
    )

@router.get("/ready", response_model=APIResponse[dict])
async def health_readiness(db: AsyncSession = Depends(get_db)):
    """Readiness probe: Performs a SELECT 1 query to verify database connectivity."""
    try:
        await db.execute(text("SELECT 1"))
        return APIResponse(
            success=True,
            data={
                "status": "READY",
                "database": "HEALTHY",
            },
            message="Hệ thống sẵn sàng xử lý yêu cầu",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cơ sở dữ liệu không khả dụng: {str(e)}",
        )

import uuid
from decimal import Decimal
from datetime import datetime, timezone
from app.models import (
    User, UserRole, OwnerProfile, Building, Room, RoomStatus,
    Tenant, Contract, ContractStatus, ContractTenant, ContractTenantRole
)
from app.core.security import hash_password

@router.post("/seed")
async def seed_staging_endpoint(db: AsyncSession = Depends(get_db)):
    """Seed staging database with Super Admin, Owner, Tenants, Buildings, Rooms & Contracts."""
    try:
        # 1. Super Admin User (Phone: 0833737181)
        stmt = select(User).where(User.phone == "0833737181")
        res = await db.execute(stmt)
        admin = res.scalar_one_or_none()
        if not admin:
            admin = User(
                id=f"usr_admin_{uuid.uuid4().hex[:8]}",
                phone="0833737181",
                email="admin.0833737181@nhatro.com",
                fullName="Quản Trị Viên Staging",
                passwordHash=hash_password("123456"),
                role=UserRole.SUPER_ADMIN,
                isActive=True,
                mustChangePassword=False,
                tokenVersion=1,
            )
            db.add(admin)
            await db.flush()

        # 2. Owner User / Người Cho Thuê (Phone: 0972095088)
        stmt = select(User).where(User.phone == "0972095088")
        res = await db.execute(stmt)
        owner = res.scalar_one_or_none()
        if not owner:
            owner = User(
                id=f"usr_owner_{uuid.uuid4().hex[:8]}",
                phone="0972095088",
                email="owner.0972095088@nhatro.com",
                fullName="Chủ Nhà Mẫu Staging",
                passwordHash=hash_password("123456"),
                role=UserRole.OWNER,
                isActive=True,
                mustChangePassword=False,
                tokenVersion=1,
            )
            db.add(owner)
            await db.flush()

            profile = OwnerProfile(
                id=f"prof_{uuid.uuid4().hex[:8]}",
                userId=owner.id,
                businessName="Chu Nha Staging Boutique",
            )
            db.add(profile)

        # 3. Tenant 1 User (Phone: 083373181)
        stmt = select(User).where(User.phone == "083373181")
        res = await db.execute(stmt)
        tenant1_user = res.scalar_one_or_none()
        if not tenant1_user:
            tenant1_user = User(
                id=f"usr_t1_{uuid.uuid4().hex[:8]}",
                phone="083373181",
                email="tenant.083373181@nhatro.com",
                fullName="Nguyễn Văn An (Khách Thuê P101)",
                passwordHash=hash_password("123456"),
                role=UserRole.TENANT,
                isActive=True,
                mustChangePassword=False,
                tokenVersion=1,
            )
            db.add(tenant1_user)
            await db.flush()

        # 4. Tenant 2 User (Phone: 0912345678)
        stmt = select(User).where(User.phone == "0912345678")
        res = await db.execute(stmt)
        tenant2_user = res.scalar_one_or_none()
        if not tenant2_user:
            tenant2_user = User(
                id=f"usr_t2_{uuid.uuid4().hex[:8]}",
                phone="0912345678",
                email="tenant.0912345678@nhatro.com",
                fullName="Trần Thị Bình (Khách Thuê P102)",
                passwordHash=hash_password("123456"),
                role=UserRole.TENANT,
                isActive=True,
                mustChangePassword=False,
                tokenVersion=1,
            )
            db.add(tenant2_user)
            await db.flush()

        # 5. Building & Rooms setup for Owner
        stmt = select(Building).where(Building.ownerId == owner.id)
        res = await db.execute(stmt)
        building = res.scalar_one_or_none()
        if not building:
            building = Building(
                id=f"bld_staging_{uuid.uuid4().hex[:8]}",
                ownerId=owner.id,
                name="Tòa Nhà Staging Boutique",
                address="123 Đường Staging, Phường Bến Nghé, Quận 1, TP.HCM",
                bankName="Vietcombank",
                bankAccountNo="9972095088",
                bankAccountName="NGUYEN VAN CHU NHA",
            )
            db.add(building)
            await db.flush()

            # Room 101 (Rented by Tenant 1)
            room101 = Room(
                id=f"rm_101_{uuid.uuid4().hex[:8]}",
                buildingId=building.id,
                roomNumber="101",
                floor=1,
                roomType="Standard",
                basePrice=Decimal("5000000"),
                areaSqM=Decimal("30.00"),
                status=RoomStatus.RENTED,
            )
            db.add(room101)

            # Room 102 (Rented by Tenant 2)
            room102 = Room(
                id=f"rm_102_{uuid.uuid4().hex[:8]}",
                buildingId=building.id,
                roomNumber="102",
                floor=1,
                roomType="VIP Balcony",
                basePrice=Decimal("7000000"),
                areaSqM=Decimal("45.00"),
                status=RoomStatus.RENTED,
            )
            db.add(room102)

            # Room 201 (Vacant / Sẵn sàng cho thuê)
            room201 = Room(
                id=f"rm_201_{uuid.uuid4().hex[:8]}",
                buildingId=building.id,
                roomNumber="201",
                floor=2,
                roomType="Standard Studio",
                basePrice=Decimal("5500000"),
                areaSqM=Decimal("35.00"),
                status=RoomStatus.VACANT,
            )
            db.add(room201)
            await db.flush()

            # Tenant Profiles
            t1 = Tenant(
                id=f"tnt_1_{uuid.uuid4().hex[:8]}",
                ownerId=owner.id,
                userId=tenant1_user.id,
                fullName="Nguyễn Văn An",
                phone="083373181",
                idCardNumber="079200001111",
            )
            db.add(t1)

            t2 = Tenant(
                id=f"tnt_2_{uuid.uuid4().hex[:8]}",
                ownerId=owner.id,
                userId=tenant2_user.id,
                fullName="Trần Thị Bình",
                phone="0912345678",
                idCardNumber="079200002222",
            )
            db.add(t2)
            await db.flush()

            # Contract 1 (Active P101)
            c1 = Contract(
                id=f"ctr_1_{uuid.uuid4().hex[:8]}",
                roomId=room101.id,
                contractCode="HD-P101",
                startDate=datetime.now(timezone.utc),
                endDate=datetime(2027, 12, 31, tzinfo=timezone.utc),
                monthlyPrice=Decimal("5000000"),
                depositAmount=Decimal("10000000"),
                billingDay=5,
                status=ContractStatus.ACTIVE,
            )
            db.add(c1)
            await db.flush()

            ct1 = ContractTenant(
                id=f"ctt_1_{uuid.uuid4().hex[:8]}",
                contractId=c1.id,
                tenantId=t1.id,
                role=ContractTenantRole.PRIMARY,
            )
            db.add(ct1)

            # Contract 2 (Active P102)
            c2 = Contract(
                id=f"ctr_2_{uuid.uuid4().hex[:8]}",
                roomId=room102.id,
                contractCode="HD-P102",
                startDate=datetime.now(timezone.utc),
                endDate=datetime(2027, 12, 31, tzinfo=timezone.utc),
                monthlyPrice=Decimal("7000000"),
                depositAmount=Decimal("14000000"),
                billingDay=5,
                status=ContractStatus.ACTIVE,
            )
            db.add(c2)
            await db.flush()

            ct2 = ContractTenant(
                id=f"ctt_2_{uuid.uuid4().hex[:8]}",
                contractId=c2.id,
                tenantId=t2.id,
                role=ContractTenantRole.PRIMARY,
            )
            db.add(ct2)

        await db.commit()
        return {
            "success": True,
            "data": {
                "super_admin": "0833737181 / 123456",
                "owner": "0972095088 / 123456",
                "tenant1_p101": "083373181 / 123456",
                "tenant2_p102": "0912345678 / 123456",
            },
            "message": "Khởi tạo dữ liệu mẫu Staging (SuperAdmin, Owner, Multi-Tenants) thành công",
        }
    except Exception as e:
        await db.rollback()
        return {
            "success": False,
            "data": None,
            "error_detail": str(e),
            "message": f"Lỗi khởi tạo seed data: {type(e).__name__}: {str(e)}",
        }
