import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import PaymentMethod, PaymentSource, PaymentStatus

if TYPE_CHECKING:
    from app.models.invoice import Invoice
    from app.models.user import User

class Payment(Base):
    __tablename__ = "Payment"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    paymentCode: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    invoiceId: Mapped[str] = mapped_column(String, ForeignKey("Invoice.id", ondelete="RESTRICT"), index=True, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    refundAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), default=Decimal(0), nullable=False)
    overpaymentAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), default=Decimal(0), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(
        SQLEnum(PaymentMethod, name="PaymentMethod", create_type=False),
        default=PaymentMethod.VIETQR,
        nullable=False,
    )
    source: Mapped[PaymentSource] = mapped_column(
        SQLEnum(PaymentSource, name="PaymentSource", create_type=False),
        default=PaymentSource.ADMIN_MANUAL,
        index=True,
        nullable=False,
    )
    status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus, name="PaymentStatus", create_type=False),
        default=PaymentStatus.PENDING,
        index=True,
        nullable=False,
    )
    provider: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    transactionRef: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    idempotencyKey: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    rawPayload: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    receivedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmedById: Mapped[Optional[str]] = mapped_column(String, ForeignKey("User.id", ondelete="SET NULL"), index=True, nullable=True)
    cancelledAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellationReason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    refundReason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    recordedById: Mapped[Optional[str]] = mapped_column(String, ForeignKey("User.id", ondelete="SET NULL"), index=True, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")
    recordedBy: Mapped[Optional["User"]] = relationship("User", foreign_keys=[recordedById], back_populates="recordedPayments")
    confirmedBy: Mapped[Optional["User"]] = relationship("User", foreign_keys=[confirmedById], back_populates="confirmedPayments")
