from abc import ABC, abstractmethod
from typing import Optional

class PrivateStorageProvider(ABC):
    @abstractmethod
    async def upload(self, file_bytes: bytes, destination_key: str, content_type: str) -> str:
        """Upload file bytes to private storage bucket/directory and return storage key."""
        pass

    @abstractmethod
    async def create_signed_url(self, storage_key: str, expires_in_seconds: int = 300) -> str:
        """Generate temporary signed URL for private file access (TTL max 300s)."""
        pass

    @abstractmethod
    async def delete(self, storage_key: str) -> bool:
        """Delete file from private storage."""
        pass
