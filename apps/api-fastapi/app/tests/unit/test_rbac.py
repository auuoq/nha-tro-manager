import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_invalid_token_format(async_client: AsyncClient):
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    response = await async_client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert "Phiên làm việc không hợp lệ" in data["message"]
