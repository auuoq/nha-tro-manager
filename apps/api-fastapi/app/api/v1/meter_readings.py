from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.meter_reading_service import MeterReadingService
from app.repositories.meter_reading_repository import MeterReadingRepository
from app.schemas.meter_reading import (
    MeterReadingCreateSchema,
    MeterReadingCorrectSchema,
    MeterReadingResponseSchema,
)
from app.schemas.common import APIResponse

router = APIRouter(tags=["Meter Readings"])
reading_service = MeterReadingService()
reading_repo = MeterReadingRepository()

@router.get("/api/v1/meters/{meter_id}/readings", response_model=APIResponse[List[MeterReadingResponseSchema]])
async def get_meter_readings(
    meter_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items = await reading_repo.get_readings_by_meter(db, meter_id)
    return APIResponse(
        success=True,
        data=[
            MeterReadingResponseSchema(
                id=r.id,
                meterId=r.meterId,
                period=r.period,
                readingDate=r.readingDate,
                previousValue=r.previousValue,
                currentValue=r.currentValue,
                consumption=r.consumption,
                status=r.status,
                note=r.note,
                imagePath=r.imagePath,
                recordedById=r.recordedById,
                createdAt=r.createdAt,
            )
            for r in items
        ],
        message="Lấy lịch sử chốt chỉ số đồng hồ thành công",
    )

@router.post("/api/v1/meters/{meter_id}/readings", response_model=APIResponse[MeterReadingResponseSchema], status_code=status.HTTP_201_CREATED)
async def record_meter_reading(
    meter_id: str,
    body: MeterReadingCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    reading = await reading_service.record_reading(db, current_user.id, meter_id, body)
    return APIResponse(
        success=True,
        data=MeterReadingResponseSchema(
            id=reading.id,
            meterId=reading.meterId,
            period=reading.period,
            readingDate=reading.readingDate,
            previousValue=reading.previousValue,
            currentValue=reading.currentValue,
            consumption=reading.consumption,
            status=reading.status,
            note=reading.note,
            imagePath=reading.imagePath,
            recordedById=reading.recordedById,
            createdAt=reading.createdAt,
        ),
        message=f"Chốt chỉ số thành công. Tiêu thụ trong kỳ: {reading.consumption}",
    )

@router.get("/api/v1/meter-readings/{reading_id}", response_model=APIResponse[MeterReadingResponseSchema])
async def get_reading_detail(
    reading_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    reading = await reading_repo.get_by_id(db, reading_id, current_user.id)
    if not reading:
        from app.core.exceptions import BusinessException
        raise BusinessException(code="METER_READING_NOT_FOUND", message="Bản chốt chỉ số không tồn tại", status_code=status.HTTP_404_NOT_FOUND)

    return APIResponse(
        success=True,
        data=MeterReadingResponseSchema(
            id=reading.id,
            meterId=reading.meterId,
            period=reading.period,
            readingDate=reading.readingDate,
            previousValue=reading.previousValue,
            currentValue=reading.currentValue,
            consumption=reading.consumption,
            status=reading.status,
            note=reading.note,
            imagePath=reading.imagePath,
            recordedById=reading.recordedById,
            createdAt=reading.createdAt,
        ),
        message="Lấy chi tiết chốt chỉ số thành công",
    )

@router.post("/api/v1/meter-readings/{reading_id}/correct", response_model=APIResponse[MeterReadingResponseSchema])
async def correct_meter_reading(
    reading_id: str,
    body: MeterReadingCorrectSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    reading = await reading_service.correct_reading(db, current_user.id, reading_id, body)
    return APIResponse(
        success=True,
        data=MeterReadingResponseSchema(
            id=reading.id,
            meterId=reading.meterId,
            period=reading.period,
            readingDate=reading.readingDate,
            previousValue=reading.previousValue,
            currentValue=reading.currentValue,
            consumption=reading.consumption,
            status=reading.status,
            note=reading.note,
            imagePath=reading.imagePath,
            recordedById=reading.recordedById,
            createdAt=reading.createdAt,
        ),
        message="Đính chính chỉ số đồng hồ thành công",
    )
