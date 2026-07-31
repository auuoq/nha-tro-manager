import pytest
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text
from httpx import AsyncClient, ASGITransport
from app.main import app

INTEGRATION_DB_URL = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/nha_tro_integration_test"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(INTEGRATION_DB_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # 1. Truncate all business tables in reverse dependency order before test execution
    async with async_session() as session:
        await session.execute(text("""
            TRUNCATE TABLE 
                "AuditLog", "Notification", "MaintenanceAttachment", "MaintenanceRequest",
                "WebhookEvent", "Payment", "InvoiceItem", "Invoice", "MeterReading",
                "Meter", "ContractTenant", "Contract", "Tenant", "RoomAsset",
                "ChargeConfig", "Room", "Building", "OwnerProfile", "User"
            RESTART IDENTITY CASCADE;
        """))
        await session.commit()
        yield session

    await engine.dispose()

@pytest.fixture(scope="function")
async def http_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
