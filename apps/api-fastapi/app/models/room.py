import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import RoomStatus

if TYPE_CHECKING:
    from app.models.building import Building
    from app.models.room_asset import RoomAsset
    from app.models.contract import Contract
    from app.models.meter import Meter
    from app.models.invoice import Invoice
    from app.models.charge_config import ChargeConfig
    from app.models.maintenance import MaintenanceRequest

class Room(Base):
    __tablename__ = "Room"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    buildingId: Mapped[str] = mapped_column(String, ForeignKey("Building.id", ondelete="RESTRICT"), index=True, nullable=False)
    roomNumber: Mapped[str] = mapped_column(String, nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False)
    roomType: Mapped[str] = mapped_column(String, nullable=False)
    basePrice: Mapped[Decimal] = mapped_column(Numeric(12, 0), nullable=False)
    areaSqM: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    status: Mapped[RoomStatus] = mapped_column(
        SQLEnum(RoomStatus, name="RoomStatus", create_type=False),
        default=RoomStatus.VACANT,
        index=True,
        nullable=False,
    )
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    building: Mapped["Building"] = relationship("Building", back_populates="rooms")
    assets: Mapped[List["RoomAsset"]] = relationship("RoomAsset", back_populates="room")
    contracts: Mapped[List["Contract"]] = relationship("Contract", back_populates="room")
    meters: Mapped[List["Meter"]] = relationship("Meter", back_populates="room")
    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="room")
    chargeConfigs: Mapped[List["ChargeConfig"]] = relationship("ChargeConfig", back_populates="room")
    maintenanceRequests: Mapped[List["MaintenanceRequest"]] = relationship("MaintenanceRequest", back_populates="room")

    __table_args__ = (
        UniqueConstraint("buildingId", "roomNumber", name="Room_buildingId_roomNumber_key"),
    )
