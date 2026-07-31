from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import ContractTenantRole

class ContractTenantCreateSchema(BaseModel):
    tenantId: str = Field(..., description="ID Khách thuê")
    role: ContractTenantRole = Field(default=ContractTenantRole.MEMBER, description="Vai trò (PRIMARY / MEMBER)")
    joinedAt: date = Field(default_factory=date.today)

class ChangePrimaryTenantSchema(BaseModel):
    newPrimaryTenantId: str = Field(..., description="ID Khách thuê được chọn làm đại diện mới (PRIMARY)")

class ContractTenantResponseSchema(BaseModel):
    id: str
    contractId: str
    tenantId: str
    tenantName: Optional[str] = None
    tenantPhone: Optional[str] = None
    role: ContractTenantRole
    joinedAt: date
    leftAt: Optional[date] = None
    createdAt: datetime
