import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import AsyncMock
from httpx import AsyncClient
from app.main import app
from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.enums import UserRole, RoomStatus, ChargeType, ChargeMethod

def create_mock_user(user_id: str, role: UserRole):
    return User(
        id=user_id,
        phone="0912345678",
        email=f"{user_id}@example.com",
        passwordHash="hashed",
        fullName="Test User",
        role=role,
        isActive=True,
        mustChangePassword=False,
    )

@pytest.mark.asyncio
async def test_tenant_cannot_access_buildings(async_client: AsyncClient):
    """TENANT user must get HTTP 403 Forbidden on Buildings API."""
    tenant_user = create_mock_user("tenant-1", UserRole.TENANT)
    mock_db = AsyncMock()

    app.dependency_overrides[get_current_user] = lambda: tenant_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        headers = {"Authorization": "Bearer fake.tenant.token"}
        response = await async_client.get("/api/v1/buildings", headers=headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    data = response.json()
    assert data["success"] is False
    assert "Yêu cầu quyền Chủ nhà" in data["message"]

@pytest.mark.asyncio
async def test_super_admin_cannot_access_owner_operational_apis(async_client: AsyncClient):
    """SUPER_ADMIN user must get HTTP 403 on owner operational APIs."""
    admin_user = create_mock_user("admin-1", UserRole.SUPER_ADMIN)
    mock_db = AsyncMock()

    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        headers = {"Authorization": "Bearer fake.admin.token"}
        response = await async_client.get("/api/v1/buildings", headers=headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403

@pytest.mark.asyncio
async def test_metered_charge_config_validation():
    """METERED charge method must be restricted to ELECTRICITY and WATER."""
    from app.schemas.charge_config import ChargeConfigCreateSchema

    # Valid
    valid_schema = ChargeConfigCreateSchema(
        chargeType=ChargeType.ELECTRICITY,
        chargeMethod=ChargeMethod.METERED,
        unitPrice=Decimal(3500),
    )
    assert valid_schema.chargeType == ChargeType.ELECTRICITY

    # Invalid: METERED for WIFI
    with pytest.raises(ValueError) as exc_info:
        ChargeConfigCreateSchema(
            chargeType=ChargeType.WIFI,
            chargeMethod=ChargeMethod.METERED,
            unitPrice=Decimal(100000),
        )
    assert "METERED" in str(exc_info.value)

@pytest.mark.asyncio
async def test_free_charge_config_validation():
    """FREE charge method must force unitPrice to 0."""
    from app.schemas.charge_config import ChargeConfigCreateSchema

    # Valid
    valid_schema = ChargeConfigCreateSchema(
        chargeType=ChargeType.PARKING,
        chargeMethod=ChargeMethod.FREE,
        unitPrice=Decimal(0),
    )
    assert valid_schema.unitPrice == Decimal(0)

    # Invalid: FREE with non-zero price
    with pytest.raises(ValueError) as exc_info:
        ChargeConfigCreateSchema(
            chargeType=ChargeType.PARKING,
            chargeMethod=ChargeMethod.FREE,
            unitPrice=Decimal(50000),
        )
    assert "FREE" in str(exc_info.value)

@pytest.mark.asyncio
async def test_maintenance_status_transition_rules():
    """Maintenance status endpoint must only allow VACANT <-> MAINTENANCE."""
    from app.schemas.room import RoomMaintenanceStatusUpdateSchema

    schema = RoomMaintenanceStatusUpdateSchema(status=RoomStatus.MAINTENANCE)
    assert schema.status == RoomStatus.MAINTENANCE
