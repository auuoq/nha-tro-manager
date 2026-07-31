from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class TenantCreateSchema(BaseModel):
    fullName: str = Field(..., min_length=1, description="Họ và tên khách thuê")
    phone: str = Field(..., min_length=10, max_length=15, description="Số điện thoại")
    idCardNumber: str = Field(..., min_length=9, max_length=20, description="Số CCCD/CMND")
    idCardIssuedDate: Optional[date] = None
    idCardIssuedPlace: Optional[str] = None
    dateOfBirth: Optional[date] = None
    gender: Optional[str] = None
    permanentAddress: Optional[str] = None
    vehicleNumber: Optional[str] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("phone", "idCardNumber", mode="before")
    def normalize_str(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

class TenantUpdateSchema(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    idCardNumber: Optional[str] = None
    idCardIssuedDate: Optional[date] = None
    idCardIssuedPlace: Optional[str] = None
    dateOfBirth: Optional[date] = None
    gender: Optional[str] = None
    permanentAddress: Optional[str] = None
    vehicleNumber: Optional[str] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    notes: Optional[str] = None

class TenantSelfProfileUpdateSchema(BaseModel):
    phone: Optional[str] = Field(default=None, min_length=10, max_length=15)
    permanentAddress: Optional[str] = None
    vehicleNumber: Optional[str] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None

class TenantResponseSchema(BaseModel):
    id: str
    ownerId: str
    userId: Optional[str] = None
    fullName: str
    phone: Optional[str] = None
    idCardNumber: Optional[str] = None
    idCardIssuedDate: Optional[date] = None
    idCardIssuedPlace: Optional[str] = None
    dateOfBirth: Optional[date] = None
    gender: Optional[str] = None
    permanentAddress: Optional[str] = None
    vehicleNumber: Optional[str] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    hasAccount: bool = False
    isAccountActive: bool = True
    createdAt: datetime
    updatedAt: datetime
