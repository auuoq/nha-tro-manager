import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.contract_tenant import ContractTenant

class Tenant(Base):
    __tablename__ = "Tenant"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ownerId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="RESTRICT"), index=True, nullable=False)
    userId: Mapped[Optional[str]] = mapped_column(String, ForeignKey("User.id", ondelete="SET NULL"), unique=True, index=True, nullable=True)
    fullName: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    dateOfBirth: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    idCardNumber: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    idCardIssuedDate: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    idCardIssuedPlace: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    idCardFrontPath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    idCardBackPath: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hometown: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    permanentAddress: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vehicleNumber: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    emergencyContactName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    emergencyContactPhone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped["User"] = relationship("User", foreign_keys=[ownerId], back_populates="managedTenants")
    user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[userId], back_populates="tenantProfile")
    contractTenants: Mapped[List["ContractTenant"]] = relationship("ContractTenant", back_populates="tenant")
