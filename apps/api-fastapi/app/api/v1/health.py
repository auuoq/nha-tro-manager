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
    """Seed staging database with initial Owner and Tenant test accounts."""
    try:
        # 1. Owner
        stmt = select(User).where(User.phone == "0987654321")
        res = await db.execute(stmt)
        owner = res.scalar_one_or_none()
        if not owner:
            owner = User(
                id=f"usr_owner_{uuid.uuid4().hex[:8]}",
                phone="0987654321",
                email="owner.staging@nhatro.com",
                fullName="Chủ Nhà Staging",
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

        # 2. Tenant
        stmt = select(User).where(User.phone == "083373181")
        res = await db.execute(stmt)
        tenant_user = res.scalar_one_or_none()
        if not tenant_user:
            tenant_user = User(
                id=f"usr_tenant_{uuid.uuid4().hex[:8]}",
                phone="083373181",
                email="tenant.staging@nhatro.com",
                fullName="Khách Thuê Mẫu Staging",
                passwordHash=hash_password("123456"),
                role=UserRole.TENANT,
                isActive=True,
                mustChangePassword=False,
                tokenVersion=1,
            )
            db.add(tenant_user)
            await db.flush()

        # 3. Building & Room
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
                bankAccountNo="9987654321",
                bankAccountName="CHU NHA STAGING",
            )
            db.add(building)
            await db.flush()

            room = Room(
                id=f"rm_staging_{uuid.uuid4().hex[:8]}",
                buildingId=building.id,
                roomNumber="101",
                floor=1,
                roomType="Standard",
                basePrice=Decimal("5000000"),
                areaSqM=Decimal("30.00"),
                status=RoomStatus.RENTED,
            )
            db.add(room)
            await db.flush()

            tenant = Tenant(
                id=f"tnt_staging_{uuid.uuid4().hex[:8]}",
                ownerId=owner.id,
                userId=tenant_user.id,
                fullName="Khách Thuê Mẫu Staging",
                phone="083373181",
                idCardNumber="079200001234",
            )
            db.add(tenant)
            await db.flush()

            contract = Contract(
                id=f"ctr_staging_{uuid.uuid4().hex[:8]}",
                roomId=room.id,
                contractCode="HD-STAGING-101",
                startDate=datetime.now(timezone.utc),
                endDate=datetime(2027, 12, 31, tzinfo=timezone.utc),
                monthlyPrice=Decimal("5000000"),
                depositAmount=Decimal("10000000"),
                billingDay=5,
                status=ContractStatus.ACTIVE,
            )
            db.add(contract)
            await db.flush()

            contract_tenant = ContractTenant(
                id=f"ctt_staging_{uuid.uuid4().hex[:8]}",
                contractId=contract.id,
                tenantId=tenant.id,
                role=ContractTenantRole.PRIMARY,
            )
            db.add(contract_tenant)

        await db.commit()
        return {
            "success": True,
            "data": {"status": "SEEDED"},
            "message": "Khởi tạo dữ liệu mẫu Staging thành công",
        }
    except Exception as e:
        await db.rollback()
        return {
            "success": False,
            "data": None,
            "error_detail": str(e),
            "message": f"Lỗi khởi tạo seed data: {type(e).__name__}: {str(e)}",
        }
