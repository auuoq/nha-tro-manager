import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nha Tro Manager API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    APP_ENV: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    # JWT Auth
    JWT_SECRET: str = "super-secret-jwt-key-change-in-production-18102003"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS — must contain exact frontend origin(s) when allow_credentials=True
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://vkacaba.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://localhost:5173", "https://vkacaba.vercel.app"]

    # Storage
    STORAGE_PROVIDER: str = "local"          # "local" | "s3"
    STORAGE_LOCAL_DIR: str = "./uploads"

    # S3-compatible storage (Supabase Storage, AWS S3, MinIO, etc.)
    S3_ENDPOINT_URL: str = ""               # e.g. https://<ref>.supabase.co/storage/v1/s3
    S3_REGION: str = "us-east-1"
    S3_BUCKET: str = "private-uploads"
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_FORCE_PATH_STYLE: str = "true"       # Required for Supabase Storage

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

