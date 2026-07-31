import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import OwnerStatus

if TYPE_CHECKING:
    from app.models.user import User

class OwnerProfile(Base):
    __tablename__ = "OwnerProfile"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="RESTRICT"), unique=True, index=True, nullable=False)
    businessName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    taxCode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[OwnerStatus] = mapped_column(
        SQLEnum(OwnerStatus, name="OwnerStatus", create_type=False),
        default=OwnerStatus.ACTIVE,
        index=True,
        nullable=False,
    )
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="ownerProfile")
