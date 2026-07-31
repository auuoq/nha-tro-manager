from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.enums import InvoiceStatus
from app.schemas.invoice_item import InvoiceItemResponseSchema

class InvoiceDraftCreateSchema(BaseModel):
    contractId: str = Field(..., description="ID Hợp đồng thuê")
    billingPeriod: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="Kỳ thanh toán định dạng YYYY-MM")
    dueDate: date = Field(..., description="Hạn thanh toán")
    cutoffDate: date = Field(default_factory=date.today, description="Ngày chốt dữ liệu khách thuê")

class InvoiceDiscountSchema(BaseModel):
    discountAmount: Decimal = Field(..., ge=0, description="Số tiền giảm giá (>= 0 VNĐ)")
    reason: str = Field(..., min_length=1, description="Lý do giảm giá")

class InvoiceCancelSchema(BaseModel):
    reason: str = Field(..., min_length=1, description="Lý do hủy hóa đơn")

class InvoiceResponseSchema(BaseModel):
    id: str
    invoiceCode: str
    roomId: str
    roomNumber: Optional[str] = None
    buildingName: Optional[str] = None
    contractId: str
    billingPeriod: str
    revision: int
    issuedAt: Optional[datetime] = None
    dueDate: datetime
    subtotalAmount: Decimal
    discountAmount: Decimal
    totalAmount: Decimal
    paidAmount: Decimal
    remainingAmount: Decimal
    previousOutstandingAmount: Optional[Decimal] = Decimal(0)
    status: InvoiceStatus
    replacedInvoiceId: Optional[str] = None
    cancellationReason: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[InvoiceItemResponseSchema]] = None
    createdAt: datetime
    updatedAt: datetime
