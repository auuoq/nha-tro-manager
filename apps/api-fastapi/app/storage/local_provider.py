import os
import time
import base64
import hmac
import hashlib
from typing import Optional
from pathlib import Path
from app.storage.base import PrivateStorageProvider

STORAGE_DIR = Path("scratch/private_storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
SECRET_KEY = "local_storage_secret_key_for_testing"

class LocalPrivateStorageProvider(PrivateStorageProvider):
    async def upload(self, file_bytes: bytes, destination_key: str, content_type: str) -> str:
        safe_key = destination_key.lstrip("/").replace("..", "_")
        file_path = STORAGE_DIR / safe_key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return safe_key

    async def create_signed_url(self, storage_key: str, expires_in_seconds: int = 300) -> str:
        ttl = min(expires_in_seconds, 300)
        expires_at = int(time.time()) + ttl
        token_data = f"{storage_key}:{expires_at}".encode()
        signature = hmac.new(SECRET_KEY.encode(), token_data, hashlib.sha256).hexdigest()
        token = base64.urlsafe_b64encode(f"{storage_key}:{expires_at}:{signature}".encode()).decode()
        return f"/api/v1/storage/private-download?token={token}"

    async def delete(self, storage_key: str) -> bool:
        safe_key = storage_key.lstrip("/").replace("..", "_")
        file_path = STORAGE_DIR / safe_key
        if file_path.exists():
            os.remove(file_path)
            return True
        return False
