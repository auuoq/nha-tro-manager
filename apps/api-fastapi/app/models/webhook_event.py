import uuid
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import String, DateTime, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class WebhookEvent(Base):
    __tablename__ = "WebhookEvent"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider: Mapped[str] = mapped_column(String, nullable=False)
    eventId: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[Any] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String, index=True, nullable=False)
    matchedInvoiceId: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    matchedPaymentId: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    errorMessage: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("provider", "eventId", name="WebhookEvent_provider_eventId_key"),
    )
