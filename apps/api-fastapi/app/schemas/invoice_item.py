from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel, Field
from app.models.enums import InvoiceItemType

class InvoiceItemCreateSchema(BaseModel):
    type: InvoiceItemType = Field(default=InvoiceItemType.OTHER, description="Loại mục chi phí")
    description: str = Field(..., min_length=1, description="Mô tả mục chi phí")
    quantity: Decimal = Field(..., gt=0, description="Số lượng (> 0)")
    unit: str = Field(default="lần", description="Đơn vị tính")
    unitPrice: Decimal = Field(..., ge=0, description="Đơn giá (>= 0 VNĐ)")
    sortOrder: int = Field(default=0, ge=0)

class InvoiceItemUpdateSchema(BaseModel):
    description: Optional[str] = None
    quantity: Optional[Decimal] = Field(default=None, gt=0)
    unit: Optional[str] = None
    unitPrice: Optional[Decimal] = Field(default=None, ge=0)
    sortOrder: Optional[int] = Field(default=None, ge=0)

class InvoiceItemResponseSchema(BaseModel):
    id: str
    invoiceId: str
    type: InvoiceItemType
    description: str
    quantity: Decimal
    unit: str
    unitPrice: Decimal
    amount: Decimal
    meterReadingId: Optional[str] = None
    previousReading: Optional[Decimal] = None
    currentReading: Optional[Decimal] = None
    calculationMetadata: Optional[Any] = None
    sortOrder: int
