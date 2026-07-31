from fastapi import status
from app.core.exceptions import BusinessException

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Allowed Magic Bytes Signatures
MAGIC_BYTES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
}

def validate_image_file(file_bytes: bytes, filename: str) -> str:
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise BusinessException(
            code="STORAGE_FILE_TOO_LARGE",
            message=f"Dung lượng file vượt quá giới hạn tối đa 5 MB ({len(file_bytes)} bytes)",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Detect Magic Bytes
    detected_mime = None
    if file_bytes.startswith(b"\xff\xd8\xff"):
        detected_mime = "image/jpeg"
    elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        detected_mime = "image/png"
    elif file_bytes.startswith(b"RIFF") and b"WEBP" in file_bytes[:16]:
        detected_mime = "image/webp"

    if not detected_mime:
        raise BusinessException(
            code="STORAGE_FILE_INVALID",
            message="Định dạng file không hợp lệ. Chỉ chấp nhận các loại hình ảnh: JPEG, PNG, WebP.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    return detected_mime
