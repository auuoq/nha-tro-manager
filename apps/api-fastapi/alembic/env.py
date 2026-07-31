import os
import asyncio
from logging.config import fileConfig
from urllib.parse import urlparse, urlunparse

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import settings
import app.models

config = context.config

if config.config_file_name:
    fileConfig(config.config_file_name)

def clean_async_db_url(url_str: str) -> str:
    if url_str.startswith("postgresql://"):
        url_str = url_str.replace("postgresql://", "postgresql+asyncpg://", 1)
    parsed = urlparse(url_str)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.path, "", parsed.fragment))

# Allow environment variable DATABASE_URL override if present
env_db_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
if env_db_url.startswith("postgresql://"):
    env_db_url = env_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

escaped_url = env_db_url.replace("%", "%%")
config.set_main_option("sqlalchemy.url", escaped_url)

target_metadata = app.models.Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    section = config.get_section(config.config_ini_section, {})
    db_url_val = section.get("sqlalchemy.url", "")
    connect_args = {}
    if any(term in db_url_val.lower() for term in ["supabase", "pooler", "6543", "pgbouncer"]):
        connect_args["statement_cache_size"] = 0

    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
