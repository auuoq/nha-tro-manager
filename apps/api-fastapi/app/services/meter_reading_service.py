from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.meter_reading_repository import MeterReadingRepository
from app.repositories.meter_repository import MeterRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.meter_reading import MeterReading
from app.models.enums import MeterReadingStatus
from app.schemas.meter_reading import MeterReadingCreateSchema, MeterReadingCorrectSchema
from app.core.exceptions import BusinessException

reading_repo = MeterReadingRepository()
meter_repo = MeterRepository()

class MeterReadingService:
    async def record_reading(
        self, db: AsyncSession, owner_id: str, meter_id: str, body: MeterReadingCreateSchema
    ) -> MeterReading:
        meter = await meter_repo.get_by_id(db, meter_id, owner_id)
        if not meter:
            raise BusinessException(
                code="METER_NOT_FOUND",
                message="Đồng hồ không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Duplicate period check
        existing_reading = await reading_repo.get_by_meter_and_period(db, meter_id, body.period)
        if existing_reading:
            raise BusinessException(
                code="METER_READING_DUPLICATE_PERIOD",
                message=f"Đã chốt chỉ số đồng hồ sê-ri {meter.serialNumber} cho kỳ {body.period} trước đó",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Lookup previous reading
        prev_reading = await reading_repo.get_latest_reading_before_period(db, meter_id, body.period)
        if prev_reading:
            previous_val = prev_reading.currentValue
        else:
            previous_val = meter.initialReading

        # Validate currentValue >= previousValue
        if body.currentValue < previous_val:
            raise BusinessException(
                code="METER_READING_VALUE_DECREASED",
                message=f"Chỉ số chốt mới ({body.currentValue}) không được nhỏ hơn chỉ số trước đó ({previous_val})",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        consumption = body.currentValue - previous_val

        async with db.begin():
            reading = MeterReading(
                meterId=meter_id,
                period=body.period.strip(),
                readingDate=body.readingDate,
                previousValue=previous_val,
                currentValue=body.currentValue,
                consumption=consumption,
                status=MeterReadingStatus.RECORDED,
                note=body.note,
                recordedById=owner_id,
            )
            await reading_repo.create(db, reading)
            await db.flush()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="RECORD_METER_READING",
                entity="MeterReading",
                entity_id=reading.id,
                details=f"Chốt chỉ số {meter.type.value} kỳ {reading.period}: Cũ = {previous_val}, Mới = {body.currentValue}, Tiêu thụ = {consumption}",
            )

        return reading

    async def correct_reading(
        self, db: AsyncSession, owner_id: str, reading_id: str, body: MeterReadingCorrectSchema
    ) -> MeterReading:
        reading = await reading_repo.get_by_id(db, reading_id, owner_id)
        if not reading:
            raise BusinessException(
                code="METER_READING_NOT_FOUND",
                message="Bản chốt chỉ số không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if body.correctedValue < reading.previousValue:
            raise BusinessException(
                code="METER_READING_VALUE_DECREASED",
                message=f"Chỉ số đính chính ({body.correctedValue}) không được nhỏ hơn chỉ số cũ ({reading.previousValue})",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            old_val = reading.currentValue
            reading.currentValue = body.correctedValue
            reading.consumption = body.correctedValue - reading.previousValue
            reading.status = MeterReadingStatus.VERIFIED

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CORRECT_METER_READING",
                entity="MeterReading",
                entity_id=reading.id,
                details=f"Đính chính chỉ số kỳ {reading.period} từ {old_val} sang {body.correctedValue}. Lý do: {body.reason}",
            )

        return reading
