import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Numeric, DateTime, ForeignKey, Index, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import MeterType

if TYPE_CHECKING:
    from app.models.room import Room
    from app.models.meter_reading import MeterReading

class Meter(Base):
    __tablename__ = "Meter"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.id", ondelete="RESTRICT"), nullable=False)
    type: Mapped[MeterType] = mapped_column(
        SQLEnum(MeterType, name="MeterType", create_type=False),
        nullable=False,
    )
    serialNumber: Mapped[str] = mapped_column(String, nullable=False)
    initialReading: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    installedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    removedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    room: Mapped["Room"] = relationship("Room", back_populates="meters")
    readings: Mapped[List["MeterReading"]] = relationship("MeterReading", back_populates="meter")

    __table_args__ = (
        Index("Meter_roomId_type_isActive_idx", "roomId", "type", "isActive"),
    )
