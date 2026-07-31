import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Numeric, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import MaintenanceStatus, MaintenancePriority

if TYPE_CHECKING:
    from app.models.room import Room
    from app.models.user import User

class MaintenanceRequest(Base):
    __tablename__ = "MaintenanceRequest"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ticketCode: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.id", ondelete="RESTRICT"), index=True, nullable=False)
    createdById: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="RESTRICT"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[MaintenancePriority] = mapped_column(
        SQLEnum(MaintenancePriority, name="MaintenancePriority", create_type=False),
        default=MaintenancePriority.MEDIUM,
        nullable=False,
    )
    status: Mapped[MaintenanceStatus] = mapped_column(
        SQLEnum(MaintenanceStatus, name="MaintenanceStatus", create_type=False),
        default=MaintenanceStatus.PENDING,
        index=True,
        nullable=False,
    )
    resolvedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 0), nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    room: Mapped["Room"] = relationship("Room", back_populates="maintenanceRequests")
    createdBy: Mapped["User"] = relationship("User", back_populates="createdMaintenances")
    attachments: Mapped[List["MaintenanceAttachment"]] = relationship("MaintenanceAttachment", back_populates="maintenanceRequest")

class MaintenanceAttachment(Base):
    __tablename__ = "MaintenanceAttachment"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    maintenanceRequestId: Mapped[str] = mapped_column(String, ForeignKey("MaintenanceRequest.id", ondelete="CASCADE"), index=True, nullable=False)
    filePath: Mapped[str] = mapped_column(String, nullable=False)
    fileType: Mapped[str] = mapped_column(String, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    maintenanceRequest: Mapped["MaintenanceRequest"] = relationship("MaintenanceRequest", back_populates="attachments")
