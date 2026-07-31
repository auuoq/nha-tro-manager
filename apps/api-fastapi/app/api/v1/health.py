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
    Tenant, Contract, ContractStatus, ContractTenant, ContractTenantRole,
    ChargeConfig, ChargeType, ChargeMethod, Meter, MeterType,
    MeterReading, MeterReadingStatus, Invoice, InvoiceStatus,
    InvoiceItem, InvoiceItemType, Payment, PaymentMethod, PaymentStatus,
    MaintenanceRequest, MaintenanceStatus, MaintenancePriority
)
from app.core.security import hash_password

@router.post("/seed")
async def seed_staging_endpoint(db: AsyncSession = Depends(get_db)):
    """Seed staging database with rich dataset (SuperAdmin, Owner, 2 Buildings, 6 Rooms, 4 Tenants, Contracts, Charges, Meters, Invoices, Payments & Maintenance)."""
    try:
        now = datetime.now(timezone.utc)

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
        else:
            admin.role = UserRole.SUPER_ADMIN
            admin.passwordHash = hash_password("123456")
            admin.fullName = "Quản Trị Viên Staging"
            admin.isActive = True
            admin.mustChangePassword = False
        await db.flush()

        # 2. Owner User (Phone: 0972095088)
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
        else:
            owner.role = UserRole.OWNER
            owner.passwordHash = hash_password("123456")
            owner.fullName = "Chủ Nhà Mẫu Staging"
            owner.isActive = True
            owner.mustChangePassword = False
        await db.flush()

        # 3. Tenant Users
        tenants_data = [
            ("083373181", "tenant.083373181@nhatro.com", "Nguyễn Văn An (P101)"),
            ("0912345678", "tenant.0912345678@nhatro.com", "Trần Thị Bình (P102)"),
            ("0923456789", "tenant.0923456789@nhatro.com", "Lê Văn Cường (P103)"),
            ("0934567890", "tenant.0934567890@nhatro.com", "Phạm Thị Dung (P201)"),
        ]
        tenant_users = []
        for phone, email, name in tenants_data:
            stmt = select(User).where(User.phone == phone)
            res = await db.execute(stmt)
            t_user = res.scalar_one_or_none()
            if not t_user:
                t_user = User(
                    id=f"usr_t_{phone[-4:]}_{uuid.uuid4().hex[:4]}",
                    phone=phone,
                    email=email,
                    fullName=name,
                    passwordHash=hash_password("123456"),
                    role=UserRole.TENANT,
                    isActive=True,
                    mustChangePassword=False,
                    tokenVersion=1,
                )
                db.add(t_user)
            else:
                t_user.role = UserRole.TENANT
                t_user.passwordHash = hash_password("123456")
                t_user.fullName = name
                t_user.isActive = True
                t_user.mustChangePassword = False
            await db.flush()
            tenant_users.append(t_user)

        # 4. Building 1: Staging Boutique Q1
        stmt = select(Building).where(Building.ownerId == owner.id, Building.name == "Tòa Nhà Staging Boutique Q1")
        res = await db.execute(stmt)
        bld1 = res.scalar_one_or_none()
        if not bld1:
            bld1 = Building(
                id=f"bld_q1_{uuid.uuid4().hex[:6]}",
                ownerId=owner.id,
                name="Tòa Nhà Staging Boutique Q1",
                address="123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
                bankName="Vietcombank",
                bankAccountNo="9972095088",
                bankAccountName="NGUYEN VAN CHU NHA",
                wifiInfo="SSID: Staging_Q1 | Pass: 88888888",
                rules="Giữ vệ sinh chung. Không gây ồn sau 22h00.",
            )
            db.add(bld1)
            await db.flush()

            # Charge Configs for Building 1
            charges = [
                (ChargeType.ELECTRICITY, ChargeMethod.METERED, Decimal("3500")),
                (ChargeType.WATER, ChargeMethod.METERED, Decimal("20000")),
                (ChargeType.WIFI, ChargeMethod.PER_ROOM, Decimal("100000")),
                (ChargeType.GARBAGE, ChargeMethod.PER_ROOM, Decimal("50000")),
            ]
            for c_type, c_method, price in charges:
                cc = ChargeConfig(
                    id=f"cc_{c_type.value}_{uuid.uuid4().hex[:4]}",
                    buildingId=bld1.id,
                    chargeType=c_type,
                    chargeMethod=c_method,
                    unitPrice=price,
                )
                db.add(cc)

            # Rooms for Building 1
            rooms_bld1 = [
                ("101", 1, "Standard Studio", Decimal("5000000"), Decimal("30.00"), RoomStatus.RENTED, tenant_users[0]),
                ("102", 1, "VIP Balcony", Decimal("7000000"), Decimal("45.00"), RoomStatus.RENTED, tenant_users[1]),
                ("103", 1, "Standard Studio", Decimal("5200000"), Decimal("32.00"), RoomStatus.RENTED, tenant_users[2]),
                ("201", 2, "Penthouse Studio", Decimal("8000000"), Decimal("50.00"), RoomStatus.RENTED, tenant_users[3]),
                ("202", 2, "Standard Studio", Decimal("5500000"), Decimal("35.00"), RoomStatus.VACANT, None),
                ("203", 2, "Standard Studio", Decimal("5500000"), Decimal("35.00"), RoomStatus.MAINTENANCE, None),
            ]

            for r_num, fl, r_type, price, area, status, t_usr in rooms_bld1:
                rm = Room(
                    id=f"rm_{r_num}_{uuid.uuid4().hex[:4]}",
                    buildingId=bld1.id,
                    roomNumber=r_num,
                    floor=fl,
                    roomType=r_type,
                    basePrice=price,
                    areaSqM=area,
                    status=status,
                )
                db.add(rm)
                await db.flush()

                # Electric & Water Meters
                m_elec = Meter(
                    id=f"mtr_elec_{r_num}_{uuid.uuid4().hex[:4]}",
                    roomId=rm.id,
                    type=MeterType.ELECTRICITY,
                    serialNumber=f"ELEC-{bld1.name[:2]}-{r_num}",
                    initialReading=Decimal("100.00"),
                )
                m_water = Meter(
                    id=f"mtr_water_{r_num}_{uuid.uuid4().hex[:4]}",
                    roomId=rm.id,
                    type=MeterType.WATER,
                    serialNumber=f"WAT-{bld1.name[:2]}-{r_num}",
                    initialReading=Decimal("20.00"),
                )
                db.add(m_elec)
                db.add(m_water)
                await db.flush()

                if t_usr:
                    # Tenant Profile
                    t_prof = Tenant(
                        id=f"tnt_prof_{r_num}_{uuid.uuid4().hex[:4]}",
                        ownerId=owner.id,
                        userId=t_usr.id,
                        fullName=t_usr.fullName,
                        phone=t_usr.phone,
                        idCardNumber=f"07920000{r_num}",
                    )
                    db.add(t_prof)
                    await db.flush()

                    # Contract
                    ctr = Contract(
                        id=f"ctr_{r_num}_{uuid.uuid4().hex[:4]}",
                        roomId=rm.id,
                        contractCode=f"HD-Q1-{r_num}",
                        startDate=now,
                        endDate=datetime(2027, 12, 31, tzinfo=timezone.utc),
                        monthlyPrice=price,
                        depositAmount=price * 2,
                        billingDay=5,
                        status=ContractStatus.ACTIVE,
                    )
                    db.add(ctr)
                    await db.flush()

                    ct_tenant = ContractTenant(
                        id=f"ctt_{r_num}_{uuid.uuid4().hex[:4]}",
                        contractId=ctr.id,
                        tenantId=t_prof.id,
                        role=ContractTenantRole.PRIMARY,
                    )
                    db.add(ct_tenant)

                    # Meter Readings for recent month
                    mr_elec = MeterReading(
                        id=f"mr_elec_{r_num}_{uuid.uuid4().hex[:4]}",
                        meterId=m_elec.id,
                        period="2026-07",
                        previousValue=Decimal("100.00"),
                        currentValue=Decimal("245.00"),
                        consumption=Decimal("145.00"),
                        recordedById=owner.id,
                        status=MeterReadingStatus.RECORDED,
                    )
                    mr_water = MeterReading(
                        id=f"mr_water_{r_num}_{uuid.uuid4().hex[:4]}",
                        meterId=m_water.id,
                        period="2026-07",
                        previousValue=Decimal("20.00"),
                        currentValue=Decimal("32.00"),
                        consumption=Decimal("12.00"),
                        recordedById=owner.id,
                        status=MeterReadingStatus.RECORDED,
                    )
                    db.add(mr_elec)
                    db.add(mr_water)
                    await db.flush()

                    # Invoice
                    inv_total = price + Decimal("145.00") * Decimal("3500") + Decimal("12.00") * Decimal("20000") + Decimal("150000")
                    inv = Invoice(
                        id=f"inv_{r_num}_{uuid.uuid4().hex[:4]}",
                        invoiceCode=f"INV-202607-{r_num}",
                        roomId=rm.id,
                        contractId=ctr.id,
                        billingPeriod="2026-07",
                        dueDate=datetime(2026, 8, 5, tzinfo=timezone.utc),
                        subtotalAmount=inv_total,
                        discountAmount=Decimal("0"),
                        totalAmount=inv_total,
                        paidAmount=inv_total if r_num == "101" else Decimal("0"),
                        remainingAmount=Decimal("0") if r_num == "101" else inv_total,
                        status=InvoiceStatus.PAID if r_num == "101" else InvoiceStatus.ISSUED,
                    )
                    db.add(inv)
                    await db.flush()

                    # Invoice Items
                    items = [
                        (InvoiceItemType.ROOM, f"Tiền phòng {r_num} (Tháng 07/2026)", Decimal("1.00"), "tháng", price),
                        (InvoiceItemType.ELECTRICITY, "Tiền điện (145 kWh x 3,500đ)", Decimal("145.00"), "kWh", Decimal("3500")),
                        (InvoiceItemType.WATER, "Tiền nước (12 m3 x 20,000đ)", Decimal("12.00"), "m3", Decimal("20000")),
                        (InvoiceItemType.WIFI, "Phí rác & Internet", Decimal("1.00"), "phòng", Decimal("150000")),
                    ]
                    for idx, (i_type, desc, qty, unit, u_price) in enumerate(items):
                        ii = InvoiceItem(
                            id=f"ii_{r_num}_{idx}_{uuid.uuid4().hex[:4]}",
                            invoiceId=inv.id,
                            type=i_type,
                            description=desc,
                            quantity=qty,
                            unit=unit,
                            unitPrice=u_price,
                            amount=qty * u_price,
                            sortOrder=idx,
                        )
                        db.add(ii)

                    # Payment for Room 101
                    if r_num == "101":
                        pmt = Payment(
                            id=f"pmt_101_{uuid.uuid4().hex[:4]}",
                            invoiceId=inv.id,
                            amount=inv_total,
                            paymentMethod=PaymentMethod.VIETQR,
                            paymentStatus=PaymentStatus.CONFIRMED,
                            paidAt=now,
                        )
                        db.add(pmt)

            # Maintenance Request for Room 101
            maint = MaintenanceRequest(
                id=f"mnt_101_{uuid.uuid4().hex[:4]}",
                roomId=rooms_bld1[0][0], # Will fetch room ID
                title="Sửa máy lạnh kêu to",
                description="Máy lạnh phòng 101 phát tiếng động rung lắc khi bật chế độ làm lạnh nhanh.",
                priority=MaintenancePriority.HIGH,
                status=MaintenanceStatus.PENDING,
            )
            # Find Room 101 ID
            stmt = select(Room).where(Room.buildingId == bld1.id, Room.roomNumber == "101")
            res = await db.execute(stmt)
            r101_obj = res.scalar_one_or_none()
            if r101_obj:
                maint.roomId = r101_obj.id
                db.add(maint)

        await db.commit()
        return {
            "success": True,
            "data": {
                "super_admin": "0833737181 / 123456",
                "owner": "0972095088 / 123456",
                "tenant1_p101": "083373181 / 123456 (Đã thanh toán Hóa đơn)",
                "tenant2_p102": "0912345678 / 123456 (Đang có Hóa đơn chờ trả)",
                "tenant3_p103": "0923456789 / 123456",
                "tenant4_p201": "0934567890 / 123456",
                "buildings_seeded": 1,
                "rooms_seeded": 6,
            },
            "message": "Đã seed bộ dữ liệu đầy đủ bao gồm Tòa nhà, Phòng, Hợp đồng, Đồng hồ điện nước, Hóa đơn, Thanh toán VietQR & Yêu cầu bảo trì!",
        }
    except Exception as e:
        await db.rollback()
        return {
            "success": False,
            "data": None,
            "error_detail": str(e),
            "message": f"Lỗi khởi tạo seed data: {type(e).__name__}: {str(e)}",
        }
