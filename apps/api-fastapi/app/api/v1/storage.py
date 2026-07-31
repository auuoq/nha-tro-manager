import uuid
from typing import Literal
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.storage.validation import validate_image_file
from app.storage.service import storage_service
from app.repositories.tenant_repository import TenantRepository
from app.repositories.meter_reading_repository import MeterReadingRepository
from app.repositories.audit_log_repository import create_audit_log
from app.schemas.common import APIResponse
from app.core.exceptions import BusinessException

router = APIRouter(prefix="/storage", tags=["Private Storage"])
tenant_repo = TenantRepository()
reading_repo = MeterReadingRepository()

@router.post("/tenants/{tenant_id}/id-card/{side}", response_model=APIResponse[dict])
async def upload_tenant_id_card(
    tenant_id: str,
    side: Literal["front", "back"],
    file: UploadFile = File(...),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_repo.get_by_id(db, tenant_id, current_user.id)
    if not tenant:
        raise BusinessException(code="TENANT_NOT_FOUND", message="Khách thuê không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

    content = await file.read()
    mime_type = validate_image_file(content, file.filename or "file.png")

    ext = "jpg" if mime_type == "image/jpeg" else ("png" if mime_type == "image/png" else "webp")
    storage_key = f"tenants/{tenant_id}/cccd_{side}_{uuid.uuid4().hex[:8]}.{ext}"

    saved_key = await storage_service.upload_file(content, storage_key, mime_type)

    async with db.begin():
        if side == "front":
            tenant.idCardFrontPath = saved_key
        else:
            tenant.idCardBackPath = saved_key

        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPLOAD_TENANT_ID_CARD",
            entity="Tenant",
            entity_id=tenant.id,
            details=f"Tải lên ảnh CCCD mặt {side} cho khách thuê {tenant.fullName}",
        )

    return APIResponse(
        success=True,
        data={"tenantId": tenant_id, "side": side, "storageKey": saved_key},
        message=f"Tải lên ảnh CCCD mặt {side} thành công",
    )

@router.get("/tenants/{tenant_id}/id-card/{side}/signed-url", response_model=APIResponse[dict])
async def get_tenant_id_card_signed_url(
    tenant_id: str,
    side: Literal["front", "back"],
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_repo.get_by_id(db, tenant_id, current_user.id)
    if not tenant:
        raise BusinessException(code="TENANT_NOT_FOUND", message="Khách thuê không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

    storage_key = tenant.idCardFrontPath if side == "front" else tenant.idCardBackPath
    if not storage_key:
        raise BusinessException(code="STORAGE_FILE_NOT_FOUND", message=f"Chưa có ảnh CCCD mặt {side}", status_code=status.HTTP_404_NOT_FOUND)

    signed_url = await storage_service.get_signed_url(storage_key, expires_in_seconds=300)

    async with db.begin():
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="VIEW_TENANT_ID_CARD",
            entity="Tenant",
            entity_id=tenant.id,
            details=f"Tạo link truy cập xem ảnh CCCD mặt {side} của khách thuê {tenant.fullName}",
        )

    return APIResponse(
        success=True,
        data={"tenantId": tenant_id, "side": side, "signedUrl": signed_url, "expiresInSeconds": 300},
        message="Sinh link truy cập riêng tư thành công",
    )

@router.post("/meter-readings/{reading_id}/image", response_model=APIResponse[dict])
async def upload_meter_reading_image(
    reading_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    reading = await reading_repo.get_by_id(db, reading_id, current_user.id)
    if not reading:
        raise BusinessException(code="METER_READING_NOT_FOUND", message="Bản chốt chỉ số không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

    content = await file.read()
    mime_type = validate_image_file(content, file.filename or "meter.png")

    ext = "jpg" if mime_type == "image/jpeg" else ("png" if mime_type == "image/png" else "webp")
    storage_key = f"meter_readings/{reading_id}/reading_{uuid.uuid4().hex[:8]}.{ext}"

    saved_key = await storage_service.upload_file(content, storage_key, mime_type)

    async with db.begin():
        reading.imagePath = saved_key

        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPLOAD_METER_READING_IMAGE",
            entity="MeterReading",
            entity_id=reading.id,
            details=f"Tải lên ảnh bằng chứng chốt chỉ số kỳ {reading.period}",
        )

    return APIResponse(
        success=True,
        data={"readingId": reading_id, "storageKey": saved_key},
        message="Tải lên ảnh chốt chỉ số đồng hồ thành công",
    )

@router.get("/meter-readings/{reading_id}/image/signed-url", response_model=APIResponse[dict])
async def get_meter_reading_image_signed_url(
    reading_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    reading = await reading_repo.get_by_id(db, reading_id, current_user.id)
    if not reading or not reading.imagePath:
        raise BusinessException(code="STORAGE_FILE_NOT_FOUND", message="Chưa có ảnh chốt chỉ số đồng hồ", status_code=status.HTTP_404_NOT_FOUND)

    signed_url = await storage_service.get_signed_url(reading.imagePath, expires_in_seconds=300)

    return APIResponse(
        success=True,
        data={"readingId": reading_id, "signedUrl": signed_url, "expiresInSeconds": 300},
        message="Sinh link truy cập riêng tư thành công",
    )
