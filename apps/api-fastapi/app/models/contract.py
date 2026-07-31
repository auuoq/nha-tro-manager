import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import ContractStatus

if TYPE_CHECKING:
    from app.models.room import Room
    from app.models.contract_tenant import ContractTenant
    from app.models.invoice import Invoice
    from app.models.charge_config import ChargeConfig

class Contract(Base):
    __tablename__ = "Contract"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.id", ondelete="RESTRICT"), index=True, nullable=False)
    contractCode: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    startDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    endDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    actualMoveInDate: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    actualMoveOutDate: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    depositAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    monthlyPrice: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    billingDay: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    status: Mapped[ContractStatus] = mapped_column(
        SQLEnum(ContractStatus, name="ContractStatus", create_type=False),
        default=ContractStatus.DRAFT,
        index=True,
        nullable=False,
    )
    cancellationReason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    terminationDate: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    terminationReason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    depositReturnedAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), default=Decimal(0), nullable=False)
    depositDeductionAmount: Mapped[Decimal] = mapped_column(Numeric(12, 0), default=Decimal(0), nullable=False)
    documentPath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    room: Mapped["Room"] = relationship("Room", back_populates="contracts")
    contractTenants: Mapped[List["ContractTenant"]] = relationship("ContractTenant", back_populates="contract")
    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="contract")
    chargeConfigs: Mapped[List["ChargeConfig"]] = relationship("ChargeConfig", back_populates="contract")
