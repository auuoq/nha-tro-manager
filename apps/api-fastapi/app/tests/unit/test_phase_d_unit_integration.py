import pytest
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import AsyncMock
from httpx import AsyncClient
from app.main import app
from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.enums import UserRole, MeterType, ChargeType
from app.schemas.meter_reading import MeterReadingCreateSchema
from app.schemas.invoice import InvoiceDiscountSchema

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
async def test_meter_reading_period_validation():
    """Period must be YYYY-MM format."""
    with pytest.raises(ValueError):
        MeterReadingCreateSchema(
            period="2026-1",  # invalid
            currentValue=Decimal(100),
        )

@pytest.mark.asyncio
async def test_discount_validation():
    """Discount amount must be non-negative."""
    with pytest.raises(ValueError):
        InvoiceDiscountSchema(
            discountAmount=Decimal(-50000),
            reason="Invalid negative discount",
        )

@pytest.mark.asyncio
async def test_tenant_invoice_view_requires_tenant_role(async_client: AsyncClient):
    """OWNER user attempting to access tenant invoices endpoint gets HTTP 403."""
    owner_user = create_mock_user("owner-1", UserRole.OWNER)
    mock_db = AsyncMock()

    app.dependency_overrides[get_current_user] = lambda: owner_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        headers = {"Authorization": "Bearer fake.owner.token"}
        response = await async_client.get("/api/v1/tenant/invoices", headers=headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
