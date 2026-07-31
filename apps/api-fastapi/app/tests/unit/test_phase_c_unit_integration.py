import pytest
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import AsyncMock
from httpx import AsyncClient
from app.main import app
from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.models.enums import UserRole
from app.schemas.contract import ContractCreateSchema

def create_mock_user(user_id: str, role: UserRole):
    return User(
        id=user_id,
        phone="0988776655",
        email=f"{user_id}@example.com",
        passwordHash="hashed",
        fullName="Mock User",
        role=role,
        isActive=True,
        mustChangePassword=False,
    )

@pytest.mark.asyncio
async def test_contract_schema_date_validation():
    """startDate must be strictly before endDate."""
    today = date.today()
    with pytest.raises(ValueError) as exc_info:
        ContractCreateSchema(
            roomId="room-123",
            startDate=today + timedelta(days=30),
            endDate=today,
            monthlyPrice=Decimal(5000000),
            depositAmount=Decimal(5000000),
            primaryTenantId="tenant-123",
        )
    assert "startDate" in str(exc_info.value)

@pytest.mark.asyncio
async def test_tenant_self_profile_requires_tenant_role(async_client: AsyncClient):
    """OWNER user accessing tenant self profile must get HTTP 403."""
    owner_user = create_mock_user("owner-1", UserRole.OWNER)
    mock_db = AsyncMock()

    app.dependency_overrides[get_current_user] = lambda: owner_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        headers = {"Authorization": "Bearer fake.owner.token"}
        response = await async_client.get("/api/v1/tenant/profile", headers=headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403

@pytest.mark.asyncio
async def test_tenant_profile_self_update_validation(async_client: AsyncClient, monkeypatch):
    """Tenant accessing own profile gets response cleanly when tenant profile exists."""
    tenant_user = create_mock_user("tenant-1", UserRole.TENANT)
    mock_db = AsyncMock()

    mock_tenant = Tenant(
        id="tenant-1",
        ownerId="owner-1",
        userId="tenant-1",
        fullName="Nguyen Van B",
        phone="0912345678",
        idCardNumber="123456789012",
        createdAt=date.today(),
        updatedAt=date.today(),
    )

    from app.services.tenant_service import TenantService
    async def mock_get_self_profile(self, db, current_user):
        return mock_tenant

    monkeypatch.setattr(TenantService, "get_tenant_self_profile", mock_get_self_profile)

    app.dependency_overrides[get_current_user] = lambda: tenant_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        headers = {"Authorization": "Bearer fake.tenant.token"}
        response = await async_client.get("/api/v1/tenant/profile", headers=headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["fullName"] == "Nguyen Van B"
