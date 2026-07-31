import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import AsyncMock
from httpx import AsyncClient
from app.main import app
from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.enums import UserRole, PaymentMethod
from app.schemas.payment import PaymentManualCreateSchema, PaymentRefundSchema
from app.storage.validation import validate_image_file, MAX_FILE_SIZE_BYTES
from app.core.exceptions import BusinessException

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
async def test_manual_payment_amount_validation():
    """Manual payment amount must be strictly greater than 0."""
    with pytest.raises(ValueError):
        PaymentManualCreateSchema(
            invoiceId="inv-123",
            amount=Decimal(0),
            method=PaymentMethod.CASH,
        )

@pytest.mark.asyncio
async def test_payment_refund_amount_validation():
    """Refund amount must be strictly greater than 0."""
    with pytest.raises(ValueError):
        PaymentRefundSchema(
            amount=Decimal(-10000),
            reason="Invalid negative refund",
        )

@pytest.mark.asyncio
async def test_storage_magic_bytes_validation():
    """Only JPEG, PNG, WebP header bytes are accepted."""
    jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    detected = validate_image_file(jpeg_bytes, "test.jpg")
    assert detected == "image/jpeg"

    # SVG / EXE bytes must raise STORAGE_FILE_INVALID
    svg_bytes = b"<svg xmlns='http://www.w3.org/2000/svg'></svg>"
    with pytest.raises(BusinessException) as exc_info:
        validate_image_file(svg_bytes, "vector.svg")
    assert exc_info.value.code == "STORAGE_FILE_INVALID"

@pytest.mark.asyncio
async def test_storage_max_file_size_validation():
    """Files exceeding 5MB must raise STORAGE_FILE_TOO_LARGE."""
    oversized_bytes = b"0" * (MAX_FILE_SIZE_BYTES + 100)
    with pytest.raises(BusinessException) as exc_info:
        validate_image_file(oversized_bytes, "huge.png")
    assert exc_info.value.code == "STORAGE_FILE_TOO_LARGE"

@pytest.mark.asyncio
async def test_tenant_payments_requires_tenant_role(async_client: AsyncClient):
    """OWNER user attempting to access tenant payments endpoint gets HTTP 403."""
    owner_user = create_mock_user("owner-1", UserRole.OWNER)
    mock_db = AsyncMock()

    app.dependency_overrides[get_current_user] = lambda: owner_user
    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        headers = {"Authorization": "Bearer fake.owner.token"}
        response = await async_client.get("/api/v1/tenant/payments", headers=headers)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
