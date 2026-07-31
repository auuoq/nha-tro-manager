import pytest
from httpx import AsyncClient
from app.core.security import create_access_token, decode_token

@pytest.mark.asyncio
async def test_jwt_token_generation_and_decoding():
    user_id = "test-user-uuid-123"
    token = create_access_token(user_id=user_id, role="OWNER", token_version=1)
    payload = decode_token(token)

    assert payload["sub"] == user_id
    assert payload["role"] == "OWNER"
    assert payload["tokenVersion"] == 1
    assert payload["type"] == "access"

@pytest.mark.asyncio
async def test_unauthorized_access_without_token(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["code"] == "HTTP_401"
