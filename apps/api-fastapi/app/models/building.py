import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.room import Room
    from app.models.charge_config import ChargeConfig

class Building(Base):
    __tablename__ = "Building"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ownerId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="RESTRICT"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bankName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bankAccountNo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bankAccountName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bankBin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    wifiInfo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rules: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped["User"] = relationship("User", back_populates="ownedBuildings")
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="building")
    chargeConfigs: Mapped[List["ChargeConfig"]] = relationship("ChargeConfig", back_populates="building")
