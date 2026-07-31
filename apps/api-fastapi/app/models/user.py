import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Integer, DateTime, func, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.owner_profile import OwnerProfile
    from app.models.building import Building
    from app.models.tenant import Tenant
    from app.models.audit_log import AuditLog
    from app.models.maintenance import MaintenanceRequest
    from app.models.notification import Notification
    from app.models.meter_reading import MeterReading
    from app.models.payment import Payment

class User(Base):
    __tablename__ = "User"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    passwordHash: Mapped[str] = mapped_column(String, nullable=False)
    fullName: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="UserRole", create_type=False),
        default=UserRole.TENANT,
        index=True,
        nullable=False,
    )
    isActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    mustChangePassword: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    tokenVersion: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    ownerProfile: Mapped[Optional["OwnerProfile"]] = relationship("OwnerProfile", back_populates="user", uselist=False)
    ownedBuildings: Mapped[List["Building"]] = relationship("Building", back_populates="owner")
    managedTenants: Mapped[List["Tenant"]] = relationship("Tenant", back_populates="owner", foreign_keys="Tenant.ownerId")
    tenantProfile: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="user", foreign_keys="Tenant.userId", uselist=False)
    auditLogs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")
    createdMaintenances: Mapped[List["MaintenanceRequest"]] = relationship("MaintenanceRequest", back_populates="createdBy")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    recordedReadings: Mapped[List["MeterReading"]] = relationship("MeterReading", foreign_keys="MeterReading.recordedById", back_populates="recordedBy")
    recordedPayments: Mapped[List["Payment"]] = relationship("Payment", foreign_keys="Payment.recordedById", back_populates="recordedBy")
    confirmedPayments: Mapped[List["Payment"]] = relationship("Payment", foreign_keys="Payment.confirmedById", back_populates="confirmedBy")
