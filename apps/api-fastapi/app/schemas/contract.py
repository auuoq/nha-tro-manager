from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator
from app.models.enums import ContractStatus

class ContractCreateSchema(BaseModel):
    roomId: str = Field(..., description="ID Phòng trọ")
    startDate: date = Field(..., description="Ngày bắt đầu hợp đồng")
    endDate: date = Field(..., description="Ngày kết thúc hợp đồng")
    monthlyPrice: Decimal = Field(..., gt=0, description="Giá thuê hàng tháng (> 0 VNĐ)")
    depositAmount: Decimal = Field(default=Decimal(0), ge=0, description="Tiền cọc (>= 0 VNĐ)")
    billingDay: int = Field(default=1, ge=1, le=28, description="Ngày chốt tiền phòng hàng tháng (1-28)")
    paymentCycleMonths: int = Field(default=1, ge=1, description="Kỳ hạn thanh toán (tháng)")
    terms: Optional[str] = None
    primaryTenantId: str = Field(..., description="ID Khách thuê đại diện (PRIMARY)")
    memberTenantIds: Optional[List[str]] = Field(default_factory=list, description="Danh sách Khách thuê thành viên (MEMBER)")

    @model_validator(mode="after")
    def validate_dates(self):
        if self.startDate >= self.endDate:
            raise ValueError("Ngày bắt đầu startDate phải nhỏ hơn ngày kết thúc endDate")
        return self

class ContractUpdateSchema(BaseModel):
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    monthlyPrice: Optional[Decimal] = Field(default=None, gt=0)
    depositAmount: Optional[Decimal] = Field(default=None, ge=0)
    billingDay: Optional[int] = Field(default=None, ge=1, le=28)
    paymentCycleMonths: Optional[int] = Field(default=None, ge=1)
    terms: Optional[str] = None

class ContractActivateSchema(BaseModel):
    pass

class ContractTerminateSchema(BaseModel):
    terminationReason: str = Field(..., min_length=1, description="Lý do chấm dứt hợp đồng")
    actualMoveOutDate: date = Field(..., description="Ngày thực tế khách dời đi")
    returnedAmount: Decimal = Field(default=Decimal(0), ge=0, description="Số tiền cọc hoàn trả khách (VNĐ)")
    deductionAmount: Decimal = Field(default=Decimal(0), ge=0, description="Số tiền cọc khấu trừ (VNĐ)")

class ContractCancelSchema(BaseModel):
    cancellationReason: str = Field(..., min_length=1, description="Lý do hủy hợp đồng DRAFT")

class ContractResponseSchema(BaseModel):
    id: str
    contractCode: str
    roomId: str
    roomNumber: Optional[str] = None
    buildingName: Optional[str] = None
    startDate: date
    endDate: date
    actualEndDate: Optional[date] = None
    monthlyPrice: Decimal
    depositAmount: Decimal
    returnedDeposit: Decimal
    depositDeductions: Decimal
    billingDay: int
    paymentCycleMonths: int
    status: ContractStatus
    terms: Optional[str] = None
    cancellationReason: Optional[str] = None
    terminationReason: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
