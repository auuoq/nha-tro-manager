import pytest
from app.storage.service import storage_service
from app.storage.validation import validate_image_file, MAX_FILE_SIZE_BYTES
from app.core.exceptions import BusinessException

@pytest.mark.asyncio
async def test_storage_validation_jpeg():
    valid_jpeg = b"\xff\xd8\xff\xe0" + b"A" * 100
    mime = validate_image_file(valid_jpeg, "test.jpg")
    assert mime == "image/jpeg"

@pytest.mark.asyncio
async def test_storage_validation_png():
    valid_png = b"\x89PNG\r\n\x1a\n" + b"B" * 100
    mime = validate_image_file(valid_png, "test.png")
    assert mime == "image/png"

@pytest.mark.asyncio
async def test_storage_validation_invalid_format():
    invalid_data = b"HELLO_WORLD_NOT_AN_IMAGE"
    with pytest.raises(BusinessException) as exc:
        validate_image_file(invalid_data, "test.txt")
    assert exc.value.code == "STORAGE_FILE_INVALID"

@pytest.mark.asyncio
async def test_storage_validation_exceeds_max_size():
    huge_data = b"\xff\xd8\xff" + b"X" * (MAX_FILE_SIZE_BYTES + 10)
    with pytest.raises(BusinessException) as exc:
        validate_image_file(huge_data, "large.jpg")
    assert exc.value.code == "STORAGE_FILE_TOO_LARGE"

@pytest.mark.asyncio
async def test_storage_upload_signed_url_delete_flow():
    test_key = "test_tenants/usr_123/id_card_front.jpg"
    test_content = b"\xff\xd8\xff\xe0test_content"

    # 1. Upload
    key = await storage_service.upload_file(test_content, test_key, "image/jpeg")
    assert key == test_key

    # 2. Generate Signed URL (max 300s)
    signed_url = await storage_service.get_signed_url(key, expires_in_seconds=600)
    assert signed_url is not None
    assert "token=" in signed_url or "http" in signed_url

    # 3. Delete
    deleted = await storage_service.delete_file(key)
    assert deleted is True
