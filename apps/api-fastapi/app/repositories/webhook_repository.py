from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.webhook_event import WebhookEvent
from app.models.enums import WebhookEventStatus

class WebhookRepository:
    async def get_by_provider_and_event_id(
        self, db: AsyncSession, provider: str, event_id: str
    ) -> Optional[WebhookEvent]:
        stmt = select(WebhookEvent).where(
            WebhookEvent.provider == provider.strip(),
            WebhookEvent.eventId == event_id.strip(),
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_unmatched_webhooks(self, db: AsyncSession) -> List[WebhookEvent]:
        stmt = select(WebhookEvent).where(
            WebhookEvent.status == WebhookEventStatus.UNMATCHED
        ).order_by(WebhookEvent.createdAt.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create(self, db: AsyncSession, event: WebhookEvent) -> WebhookEvent:
        db.add(event)
        return event
