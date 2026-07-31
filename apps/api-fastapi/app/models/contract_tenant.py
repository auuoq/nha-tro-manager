import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import ContractTenantRole

if TYPE_CHECKING:
    from app.models.contract import Contract
    from app.models.tenant import Tenant

class ContractTenant(Base):
    __tablename__ = "ContractTenant"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contractId: Mapped[str] = mapped_column(String, ForeignKey("Contract.id", ondelete="RESTRICT"), index=True, nullable=False)
    tenantId: Mapped[str] = mapped_column(String, ForeignKey("Tenant.id", ondelete="RESTRICT"), index=True, nullable=False)
    role: Mapped[ContractTenantRole] = mapped_column(
        SQLEnum(ContractTenantRole, name="ContractTenantRole", create_type=False),
        default=ContractTenantRole.MEMBER,
        nullable=False,
    )
    joinedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    leftAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    contract: Mapped["Contract"] = relationship("Contract", back_populates="contractTenants")
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="contractTenants")

    __table_args__ = (
        UniqueConstraint("contractId", "tenantId", name="ContractTenant_contractId_tenantId_key"),
    )
