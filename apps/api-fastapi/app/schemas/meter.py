from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import MeterType

class MeterCreateSchema(BaseModel):
    roomId: str = Field(..., description="ID Phòng trọ")
    type: MeterType = Field(..., description="Loại đồng hồ (ELECTRICITY hoặc WATER)")
    serialNumber: str = Field(..., min_length=1, description="Số sê-ri đồng hồ")
    initialReading: Decimal = Field(default=Decimal(0), ge=0, description="Chỉ số ban đầu khi lắp đặt (>= 0)")
    installedAt: date = Field(default_factory=date.today, description="Ngày lắp đặt")

class MeterUpdateSchema(BaseModel):
    serialNumber: Optional[str] = None
    installedAt: Optional[date] = None

class MeterReplaceSchema(BaseModel):
    newSerialNumber: str = Field(..., min_length=1, description="Số sê-ri đồng hồ mới")
    newInitialReading: Decimal = Field(..., ge=0, description="Chỉ số ban đầu đồng hồ mới (>= 0)")
    replacedAt: date = Field(default_factory=date.today, description="Ngày thay đồng hồ")
    reason: str = Field(..., min_length=1, description="Lý do thay thế")
    note: Optional[str] = None

class MeterResponseSchema(BaseModel):
    id: str
    roomId: str
    roomNumber: Optional[str] = None
    buildingName: Optional[str] = None
    type: MeterType
    serialNumber: str
    initialReading: Decimal
    isActive: bool
    installedAt: date
    removedAt: Optional[date] = None
    createdAt: datetime
    updatedAt: datetime
