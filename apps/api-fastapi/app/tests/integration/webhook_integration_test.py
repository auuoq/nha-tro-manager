import pytest
import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import WebhookEvent

@pytest.mark.asyncio
async def test_webhook_event_deduplication_integration(db_session: AsyncSession):
    evt_id = f"EVT_CASSO_{uuid.uuid4().hex[:8]}"

    event1 = WebhookEvent(
        id=f"evt_1_{uuid.uuid4().hex[:6]}",
        provider="CASSO",
        eventId=evt_id,
        payload={"amount": 3500000, "description": "Thanh toan HD INV100"},
        status="UNMATCHED",
    )
    db_session.add(event1)
    await db_session.commit()

    # Query back Webhook Event
    res = await db_session.execute(select(WebhookEvent).where(WebhookEvent.eventId == evt_id))
    evt = res.scalar_one()
    assert evt.eventId == evt_id
    assert evt.status == "UNMATCHED"
