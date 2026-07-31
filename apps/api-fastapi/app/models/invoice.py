import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import InvoiceStatus

if TYPE_CHECKING:
    from app.models.room import Room
    from app.models.contract import Contract
    from app.models.invoice_item import InvoiceItem
    from app.models.payment import Payment

class Invoice(Base):
    __tablename__ = "Invoice"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoiceCode: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.id", ondelete="RESTRICT"), index=True, nullable=False)
    contractId: Mapped[str] = mapped_column(String, ForeignKey("Contract.id", ondelete="RESTRICT"), index=True, nullable=False)
    billingPeriod: Mapped[str] = mapped_column(String, index=True, nullable=False)
    revision: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    issuedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    dueDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    subtotalAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    discountAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), default=Decimal(0), nullable=False)
    totalAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    paidAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), default=Decimal(0), nullable=False)
    remainingAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    status: Mapped[InvoiceStatus] = mapped_column(
        SQLEnum(InvoiceStatus, name="InvoiceStatus", create_type=False),
        default=InvoiceStatus.DRAFT,
        index=True,
        nullable=False,
    )
    replacedInvoiceId: Mapped[Optional[str]] = mapped_column(String, ForeignKey("Invoice.id", ondelete="RESTRICT"), nullable=True)
    cancellationReason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    room: Mapped["Room"] = relationship("Room", back_populates="invoices")
    contract: Mapped["Contract"] = relationship("Contract", back_populates="invoices")
    replacedInvoice: Mapped[Optional["Invoice"]] = relationship("Invoice", remote_side=[id], back_populates="revisions")
    revisions: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="replacedInvoice")
    items: Mapped[List["InvoiceItem"]] = relationship("InvoiceItem", back_populates="invoice")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="invoice")

    __table_args__ = (
        UniqueConstraint("contractId", "billingPeriod", "revision", name="Invoice_contractId_billingPeriod_revision_key"),
    )
