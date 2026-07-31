import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Numeric, DateTime, ForeignKey, UniqueConstraint, Index, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import MeterReadingStatus

if TYPE_CHECKING:
    from app.models.meter import Meter
    from app.models.user import User
    from app.models.invoice_item import InvoiceItem

class MeterReading(Base):
    __tablename__ = "MeterReading"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meterId: Mapped[str] = mapped_column(String, ForeignKey("Meter.id", ondelete="RESTRICT"), index=True, nullable=False)
    period: Mapped[str] = mapped_column(String, index=True, nullable=False)
    previousValue: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currentValue: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    consumption: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    imagePath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[MeterReadingStatus] = mapped_column(
        SQLEnum(MeterReadingStatus, name="MeterReadingStatus", create_type=False),
        default=MeterReadingStatus.RECORDED,
        nullable=False,
    )
    recordedById: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="RESTRICT"), index=True, nullable=False)
    recordedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    meter: Mapped["Meter"] = relationship("Meter", back_populates="readings")
    recordedBy: Mapped["User"] = relationship("User", foreign_keys=[recordedById], back_populates="recordedReadings")
    invoiceItems: Mapped[List["InvoiceItem"]] = relationship("InvoiceItem", back_populates="meterReading")

    __table_args__ = (
        UniqueConstraint("meterId", "period", name="MeterReading_meterId_period_key"),
    )
