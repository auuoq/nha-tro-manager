import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Index, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import ChargeType, ChargeMethod

if TYPE_CHECKING:
    from app.models.building import Building
    from app.models.room import Room
    from app.models.contract import Contract

class ChargeConfig(Base):
    __tablename__ = "ChargeConfig"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    buildingId: Mapped[Optional[str]] = mapped_column(String, ForeignKey("Building.id", ondelete="RESTRICT"), index=True, nullable=True)
    roomId: Mapped[Optional[str]] = mapped_column(String, ForeignKey("Room.id", ondelete="RESTRICT"), index=True, nullable=True)
    contractId: Mapped[Optional[str]] = mapped_column(String, ForeignKey("Contract.id", ondelete="RESTRICT"), index=True, nullable=True)
    chargeType: Mapped[ChargeType] = mapped_column(
        SQLEnum(ChargeType, name="ChargeType", create_type=False),
        nullable=False,
    )
    chargeMethod: Mapped[ChargeMethod] = mapped_column(
        SQLEnum(ChargeMethod, name="ChargeMethod", create_type=False),
        nullable=False,
    )
    unitPrice: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    effectiveFrom: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    effectiveTo: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    building: Mapped[Optional["Building"]] = relationship("Building", back_populates="chargeConfigs")
    room: Mapped[Optional["Room"]] = relationship("Room", back_populates="chargeConfigs")
    contract: Mapped[Optional["Contract"]] = relationship("Contract", back_populates="chargeConfigs")

    __table_args__ = (
        Index("ChargeConfig_chargeType_effectiveFrom_idx", "chargeType", "effectiveFrom"),
    )
