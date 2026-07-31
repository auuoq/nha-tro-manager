# apps/api-fastapi/Dockerfile
# Multi-stage: install deps then copy source.
# Build context: apps/api-fastapi/

FROM python:3.12-slim AS base

WORKDIR /app

# Install OS dependencies for asyncpg (libpq) and boto3
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (cache layer)
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy application source
COPY . .

EXPOSE 8000

# Automatically run Alembic DB migrations on startup before launching Uvicorn ASGI server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
