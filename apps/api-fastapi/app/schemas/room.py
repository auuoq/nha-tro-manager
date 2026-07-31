from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.models.enums import RoomStatus

class RoomCreateSchema(BaseModel):
    buildingId: str = Field(..., description="ID Tòa nhà")
    roomNumber: str = Field(..., min_length=1, description="Số phòng (e.g. 101)")
    floor: int = Field(..., ge=0, description="Tầng")
    roomType: str = Field(default="Standard", description="Loại phòng")
    basePrice: Decimal = Field(..., ge=0, description="Giá thuê cơ bản (VNĐ)")
    areaSqM: Decimal = Field(..., gt=0, description="Diện tích (m²)")

class RoomUpdateSchema(BaseModel):
    roomNumber: Optional[str] = None
    floor: Optional[int] = Field(default=None, ge=0)
    roomType: Optional[str] = None
    basePrice: Optional[Decimal] = Field(default=None, ge=0)
    areaSqM: Optional[Decimal] = Field(default=None, gt=0)

    @field_validator("basePrice", "areaSqM", mode="before")
    def check_non_negative(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError("Giá trị không được nhỏ hơn 0")
        return v

class RoomMaintenanceStatusUpdateSchema(BaseModel):
    status: RoomStatus = Field(..., description="Trạng thái chỉ cho phép VACANT hoặc MAINTENANCE")

class RoomResponseSchema(BaseModel):
    id: str
    buildingId: str
    buildingName: Optional[str] = None
    roomNumber: str
    floor: int
    roomType: str
    basePrice: Decimal
    areaSqM: Decimal
    status: RoomStatus
    createdAt: datetime
    updatedAt: datetime

# Room Assets Schemas
class RoomAssetCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, description="Tên trang thiết bị")
    assetCode: Optional[str] = None
    condition: str = Field(default="GOOD", description="Tình trạng (GOOD, DAMAGED, REPAIRING)")
    quantity: int = Field(default=1, ge=1, description="Số lượng (tối thiểu 1)")
    note: Optional[str] = None

class RoomAssetUpdateSchema(BaseModel):
    name: Optional[str] = None
    assetCode: Optional[str] = None
    condition: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=1)
    note: Optional[str] = None

class RoomAssetResponseSchema(BaseModel):
    id: str
    roomId: str
    name: str
    assetCode: Optional[str] = None
    condition: str
    quantity: int
    note: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
