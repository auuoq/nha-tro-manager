from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from app.models.enums import ChargeType, ChargeMethod

class ChargeConfigCreateSchema(BaseModel):
    chargeType: ChargeType
    chargeMethod: ChargeMethod
    unitPrice: Decimal = Field(..., ge=0, description="Đơn giá (VNĐ)")
    effectiveFrom: datetime = Field(default_factory=datetime.now)
    effectiveTo: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_rules(self):
        if self.chargeMethod == ChargeMethod.METERED and self.chargeType not in [ChargeType.ELECTRICITY, ChargeType.WATER]:
            raise ValueError("Hình thức METERED (chốt đồng hồ) chỉ áp dụng cho Điện (ELECTRICITY) và Nước (WATER)")
        if self.chargeMethod == ChargeMethod.FREE and self.unitPrice != Decimal(0):
            raise ValueError("Hình thức FREE (Miễn phí) bắt buộc đơn giá unitPrice phải bằng 0")
        if self.effectiveTo and self.effectiveFrom > self.effectiveTo:
            raise ValueError("Thời gian bắt đầu effectiveFrom không được lớn hơn thời gian kết thúc effectiveTo")
        return self

class ChargeConfigUpdateSchema(BaseModel):
    chargeMethod: Optional[ChargeMethod] = None
    unitPrice: Optional[Decimal] = Field(default=None, ge=0)
    effectiveFrom: Optional[datetime] = None
    effectiveTo: Optional[datetime] = None

class ChargeConfigResponseSchema(BaseModel):
    id: str
    buildingId: Optional[str] = None
    roomId: Optional[str] = None
    contractId: Optional[str] = None
    chargeType: ChargeType
    chargeMethod: ChargeMethod
    unitPrice: Decimal
    effectiveFrom: datetime
    effectiveTo: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
