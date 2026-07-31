import uuid
from decimal import Decimal
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import InvoiceItemType

if TYPE_CHECKING:
    from app.models.invoice import Invoice
    from app.models.meter_reading import MeterReading

class InvoiceItem(Base):
    __tablename__ = "InvoiceItem"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoiceId: Mapped[str] = mapped_column(String, ForeignKey("Invoice.id", ondelete="RESTRICT"), index=True, nullable=False)
    type: Mapped[InvoiceItemType] = mapped_column(
        SQLEnum(InvoiceItemType, name="InvoiceItemType", create_type=False),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String, nullable=False)
    unitPrice: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    meterReadingId: Mapped[Optional[str]] = mapped_column(String, ForeignKey("MeterReading.id", ondelete="SET NULL"), index=True, nullable=True)
    previousReading: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    currentReading: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    calculationMetadata: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")
    meterReading: Mapped[Optional["MeterReading"]] = relationship("MeterReading", back_populates="invoiceItems")
