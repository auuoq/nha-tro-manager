from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.contract_tenant import ContractTenant
from app.models.enums import ContractTenantRole

class ContractTenantRepository:
    async def get_by_contract_and_tenant(
        self, db: AsyncSession, contract_id: str, tenant_id: str
    ) -> Optional[ContractTenant]:
        stmt = select(ContractTenant).where(
            ContractTenant.contractId == contract_id,
            ContractTenant.tenantId == tenant_id,
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all_by_contract(
        self, db: AsyncSession, contract_id: str, active_only: bool = True
    ) -> List[ContractTenant]:
        conditions = [ContractTenant.contractId == contract_id]
        if active_only:
            conditions.append(ContractTenant.leftAt.is_(None))

        stmt = select(ContractTenant).where(and_(*conditions)).order_by(ContractTenant.role.asc(), ContractTenant.joinedAt.asc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_active_primary(self, db: AsyncSession, contract_id: str) -> Optional[ContractTenant]:
        stmt = select(ContractTenant).where(
            ContractTenant.contractId == contract_id,
            ContractTenant.role == ContractTenantRole.PRIMARY,
            ContractTenant.leftAt.is_(None),
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def create(self, db: AsyncSession, relation: ContractTenant) -> ContractTenant:
        db.add(relation)
        return relation
