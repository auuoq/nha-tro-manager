import os
import asyncio
from typing import Optional
import boto3
from botocore.config import Config
from app.storage.base import PrivateStorageProvider

class S3PrivateStorageProvider(PrivateStorageProvider):
    def __init__(self):
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL")
        self.region_name = os.getenv("S3_REGION", "us-east-1")
        self.bucket_name = os.getenv("S3_BUCKET", "private-uploads")
        self.access_key = os.getenv("S3_ACCESS_KEY_ID")
        self.secret_key = os.getenv("S3_SECRET_ACCESS_KEY")
        self.force_path_style = os.getenv("S3_FORCE_PATH_STYLE", "true").lower() == "true"

        config = Config(
            region_name=self.region_name,
            s3={'addressing_style': 'path' if self.force_path_style else 'auto'}
        )

        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            config=config
        )

    def _sync_upload(self, file_bytes: bytes, destination_key: str, content_type: str) -> str:
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=destination_key,
            Body=file_bytes,
            ContentType=content_type
        )
        return destination_key

    async def upload(self, file_bytes: bytes, destination_key: str, content_type: str) -> str:
        return await asyncio.to_thread(self._sync_upload, file_bytes, destination_key, content_type)

    def _sync_create_signed_url(self, storage_key: str, expires_in_seconds: int = 300) -> str:
        ttl = min(expires_in_seconds, 300)
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": storage_key},
            ExpiresIn=ttl
        )

    async def create_signed_url(self, storage_key: str, expires_in_seconds: int = 300) -> str:
        return await asyncio.to_thread(self._sync_create_signed_url, storage_key, expires_in_seconds)

    def _sync_delete(self, storage_key: str) -> bool:
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=storage_key)
            return True
        except Exception:
            return False

    async def delete(self, storage_key: str) -> bool:
        return await asyncio.to_thread(self._sync_delete, storage_key)
