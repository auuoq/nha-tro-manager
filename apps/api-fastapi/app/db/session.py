from typing import AsyncGenerator
import os
from urllib.parse import urlparse, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

def clean_async_db_url(url_str: str) -> str:
    if url_str.startswith("postgresql://"):
        url_str = url_str.replace("postgresql://", "postgresql+asyncpg://", 1)
    parsed = urlparse(url_str)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, "", parsed.fragment))

# os.environ takes priority over .env file loaded at import time by pydantic-settings.
# This is critical for tests that set DATABASE_URL env var before launching pytest.
_raw_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
db_url = clean_async_db_url(_raw_url)

connect_args = {}
if any(term in db_url.lower() for term in ["supabase", "pooler", "6543", "pgbouncer"]):
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
