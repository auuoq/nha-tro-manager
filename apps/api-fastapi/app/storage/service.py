import os
from app.storage.base import PrivateStorageProvider
from app.storage.local_provider import LocalPrivateStorageProvider
from app.storage.s3_provider import S3PrivateStorageProvider

class StorageService:
    def __init__(self):
        provider_type = os.getenv("STORAGE_PROVIDER", "local").lower()
        if provider_type in ("s3", "supabase"):
            self.provider: PrivateStorageProvider = S3PrivateStorageProvider()
        else:
            self.provider: PrivateStorageProvider = LocalPrivateStorageProvider()

    async def upload_file(self, file_bytes: bytes, destination_key: str, content_type: str) -> str:
        return await self.provider.upload(file_bytes, destination_key, content_type)

    async def get_signed_url(self, storage_key: str, expires_in_seconds: int = 300) -> str:
        # Guarantee signed URL TTL is <= 300 seconds
        ttl = min(expires_in_seconds, 300)
        return await self.provider.create_signed_url(storage_key, expires_in_seconds=ttl)

    async def delete_file(self, storage_key: str) -> bool:
        return await self.provider.delete(storage_key)

storage_service = StorageService()
