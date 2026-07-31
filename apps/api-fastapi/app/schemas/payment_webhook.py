from datetime import datetime
from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel, Field
from app.models.enums import WebhookEventStatus

class BankWebhookPayloadSchema(BaseModel):
    provider: str = Field(default="SEPAY", description="Tên nhà cung cấp Webhook (SEPAY, CASSO,...)")
    eventId: str = Field(..., description="ID sự kiện Webhook duy nhất")
    transactionId: str = Field(..., description="Mã giao dịch ngân hàng")
    amount: Decimal = Field(..., gt=0, description="Số tiền chuyển khoản")
    content: str = Field(..., description="Nội dung chuyển khoản")
    transactionTime: datetime = Field(default_factory=datetime.now)

class WebhookMatchSchema(BaseModel):
    invoiceId: str = Field(..., description="ID Hóa đơn muốn gán thủ công")

class WebhookEventResponseSchema(BaseModel):
    id: str
    provider: str
    eventId: str
    transactionId: str
    amount: int
    content: str
    matchedInvoiceId: Optional[str] = None
    matchedPaymentId: Optional[str] = None
    status: WebhookEventStatus
    createdAt: datetime
