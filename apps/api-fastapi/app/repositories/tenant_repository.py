from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.tenant import Tenant
from app.models.contract_tenant import ContractTenant
from app.models.contract import Contract
from app.models.enums import ContractStatus

class TenantRepository:
    async def get_by_id(self, db: AsyncSession, tenant_id: str, owner_id: Optional[str] = None) -> Optional[Tenant]:
        query = select(Tenant).where(Tenant.id == tenant_id, Tenant.deletedAt.is_(None))
        if owner_id:
            query = query.where(Tenant.ownerId == owner_id)
        res = await db.execute(query)
        return res.scalar_one_or_none()

    async def get_by_id_card(self, db: AsyncSession, owner_id: str, id_card_number: str) -> Optional[Tenant]:
        stmt = select(Tenant).where(
            Tenant.ownerId == owner_id,
            Tenant.idCardNumber == id_card_number.strip(),
            Tenant.deletedAt.is_(None),
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_user_id(self, db: AsyncSession, user_id: str) -> Optional[Tenant]:
        stmt = select(Tenant).where(Tenant.userId == user_id, Tenant.deletedAt.is_(None))
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_all_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tenant], int]:
        base_where = [Tenant.ownerId == owner_id, Tenant.deletedAt.is_(None)]
        if search and search.strip():
            s = f"%{search.strip()}%"
            base_where.append(
                or_(
                    Tenant.fullName.ilike(s),
                    Tenant.phone.ilike(s),
                    Tenant.idCardNumber.ilike(s),
                )
            )

        count_stmt = select(func.count(Tenant.id)).where(and_(*base_where))
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one()

        offset = (page - 1) * page_size
        stmt = (
            select(Tenant)
            .where(and_(*base_where))
            .order_by(Tenant.createdAt.desc())
            .offset(offset)
            .limit(page_size)
        )
        res = await db.execute(stmt)
        items = list(res.scalars().all())

        return items, total

    async def count_active_contracts(self, db: AsyncSession, tenant_id: str) -> int:
        stmt = (
            select(func.count(Contract.id))
            .join(ContractTenant, Contract.id == ContractTenant.contractId)
            .where(
                ContractTenant.tenantId == tenant_id,
                ContractTenant.leftAt.is_(None),
                Contract.status == ContractStatus.ACTIVE,
                Contract.deletedAt.is_(None),
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    async def create(self, db: AsyncSession, tenant: Tenant) -> Tenant:
        db.add(tenant)
        return tenant
