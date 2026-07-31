from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class BuildingCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, description="Tên tòa nhà")
    address: str = Field(..., min_length=1, description="Địa chỉ thực tế")
    description: Optional[str] = None
    bankName: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankAccountName: Optional[str] = None
    bankBin: Optional[str] = None
    wifiInfo: Optional[str] = None
    rules: Optional[str] = None

class BuildingUpdateSchema(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    bankName: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankAccountName: Optional[str] = None
    bankBin: Optional[str] = None
    wifiInfo: Optional[str] = None
    rules: Optional[str] = None

class BuildingResponseSchema(BaseModel):
    id: str
    ownerId: str
    name: str
    address: str
    description: Optional[str] = None
    bankName: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankAccountName: Optional[str] = None
    bankBin: Optional[str] = None
    wifiInfo: Optional[str] = None
    rules: Optional[str] = None
    roomsCount: Optional[int] = 0
    createdAt: datetime
    updatedAt: datetime
