from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.services.webhook_service import WebhookService
from app.schemas.payment_webhook import (
    BankWebhookPayloadSchema,
    WebhookMatchSchema,
    WebhookEventResponseSchema,
)
from app.schemas.common import APIResponse

router = APIRouter(tags=["Bank Webhooks"])
webhook_service = WebhookService()

@router.post("/api/v1/webhooks/bank", response_model=APIResponse[WebhookEventResponseSchema])
async def receive_bank_webhook(
    body: BankWebhookPayloadSchema,
    db: AsyncSession = Depends(get_db),
):
    event = await webhook_service.process_bank_webhook(db, body)
    amount_int = int(Decimal(str(event.payload.get("amount", 0)))) if event.payload else 0

    return APIResponse(
        success=True,
        data=WebhookEventResponseSchema(
            id=event.id,
            provider=event.provider,
            eventId=event.eventId,
            transactionId=str(event.payload.get("transactionId", "")),
            amount=amount_int,
            content=str(event.payload.get("content", "")),
            matchedInvoiceId=event.matchedInvoiceId,
            matchedPaymentId=event.matchedPaymentId,
            status=event.status,
            createdAt=event.createdAt,
        ),
        message="Xử lý giao dịch Webhook ngân hàng thành công",
    )

@router.get("/api/v1/webhooks/bank/unmatched", response_model=APIResponse[List[WebhookEventResponseSchema]])
async def get_unmatched_webhooks(
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    events = await webhook_service.get_unmatched_webhooks(db)
    return APIResponse(
        success=True,
        data=[
            WebhookEventResponseSchema(
                id=e.id,
                provider=e.provider,
                eventId=e.eventId,
                transactionId=str(e.payload.get("transactionId", "")),
                amount=int(Decimal(str(e.payload.get("amount", 0)))),
                content=str(e.payload.get("content", "")),
                matchedInvoiceId=e.matchedInvoiceId,
                matchedPaymentId=e.matchedPaymentId,
                status=e.status,
                createdAt=e.createdAt,
            )
            for e in events
        ],
        message="Lấy danh sách chuyển khoản chưa ghép nối thành công",
    )

@router.post("/api/v1/webhooks/bank/{event_id}/match", response_model=APIResponse[WebhookEventResponseSchema])
async def match_unmatched_webhook(
    event_id: str,
    body: WebhookMatchSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    event = await webhook_service.match_unmatched_webhook(db, current_user.id, event_id, body)
    amount_int = int(Decimal(str(event.payload.get("amount", 0))))

    return APIResponse(
        success=True,
        data=WebhookEventResponseSchema(
            id=event.id,
            provider=event.provider,
            eventId=event.eventId,
            transactionId=str(event.payload.get("transactionId", "")),
            amount=amount_int,
            content=str(event.payload.get("content", "")),
            matchedInvoiceId=event.matchedInvoiceId,
            matchedPaymentId=event.matchedPaymentId,
            status=event.status,
            createdAt=event.createdAt,
        ),
        message="Ghép nối thủ công giao dịch chuyển khoản thành công",
    )
