from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel, Field
from app.models.enums import MeterReadingStatus

class MeterReadingCreateSchema(BaseModel):
    period: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="Kỳ chốt chỉ số định dạng YYYY-MM")
    currentValue: Decimal = Field(..., ge=0, description="Chỉ số mới chốt (>= 0)")
    readingDate: date = Field(default_factory=date.today, description="Ngày chốt chỉ số")
    note: Optional[str] = None
    imageMetadata: Optional[Any] = None

class MeterReadingCorrectSchema(BaseModel):
    correctedValue: Decimal = Field(..., ge=0, description="Chỉ số sau khi đính chính (>= 0)")
    reason: str = Field(..., min_length=1, description="Lý do đính chính")

class MeterReadingResponseSchema(BaseModel):
    id: str
    meterId: str
    period: str
    readingDate: date
    previousValue: Decimal
    currentValue: Decimal
    consumption: Decimal
    status: MeterReadingStatus
    note: Optional[str] = None
    imagePath: Optional[str] = None
    recordedById: Optional[str] = None
    createdAt: datetime
