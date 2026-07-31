from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_serializer
from app.models.enums import PaymentMethod, PaymentStatus

class PaymentManualCreateSchema(BaseModel):
    invoiceId: str = Field(..., description="ID Hóa đơn thanh toán")
    amount: Decimal = Field(..., gt=0, description="Số tiền thanh toán (> 0 VNĐ)")
    method: PaymentMethod = Field(..., description="Phương thức thanh toán (CASH, BANK_TRANSFER, OTHER)")
    paidAt: datetime = Field(default_factory=datetime.now, description="Thời gian thực hiện thanh toán")
    transactionRef: Optional[str] = Field(default=None, description="Mã giao dịch tham chiếu")
    note: Optional[str] = None

class PaymentCancelSchema(BaseModel):
    reason: str = Field(..., min_length=1, description="Lý do hủy giao dịch thanh toán")

class PaymentRefundSchema(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Số tiền hoàn trả (> 0 VNĐ)")
    reason: str = Field(..., min_length=1, description="Lý do hoàn tiền")
    refundedAt: datetime = Field(default_factory=datetime.now)

class PaymentResponseSchema(BaseModel):
    id: str
    invoiceId: str
    amount: int
    method: PaymentMethod
    status: PaymentStatus
    paidAt: datetime
    transactionRef: Optional[str] = None
    maskedTransactionRef: Optional[str] = None
    refundAmount: int = 0
    netAmount: int
    note: Optional[str] = None
    cancelledAt: Optional[datetime] = None
    createdAt: datetime

    @field_serializer("amount", "refundAmount", "netAmount")
    def serialize_int_currency(self, v: Decimal | int, _info) -> int:
        if v is None:
            return 0
        return int(v)
