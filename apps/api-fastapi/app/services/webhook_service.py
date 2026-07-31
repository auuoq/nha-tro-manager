import re
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.webhook_repository import WebhookRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.invoice_repository import InvoiceRepository
from app.repositories.audit_log_repository import create_audit_log
from app.services.payment_ledger_service import PaymentLedgerService
from app.models.webhook_event import WebhookEvent
from app.models.payment import Payment
from app.models.invoice import Invoice
from app.models.enums import WebhookEventStatus, PaymentMethod, PaymentStatus, InvoiceStatus
from app.schemas.payment_webhook import BankWebhookPayloadSchema, WebhookMatchSchema
from app.core.exceptions import BusinessException

webhook_repo = WebhookRepository()
payment_repo = PaymentRepository()
invoice_repo = InvoiceRepository()
ledger_service = PaymentLedgerService()

class WebhookService:
    async def process_bank_webhook(self, db: AsyncSession, payload: BankWebhookPayloadSchema) -> WebhookEvent:
        # Idempotency Check on DB Unique WebhookEvent(provider, eventId)
        existing_event = await webhook_repo.get_by_provider_and_event_id(db, payload.provider, payload.eventId)
        if existing_event:
            return existing_event  # Return idempotent success response

        # Extract invoiceCode accurately via Regex from transfer content (e.g. "INV-202607-0001" or "INV2026070001")
        clean_content = payload.content.upper().strip()
        match = re.search(r"INV-?\d{6}-?\d{4}", clean_content)

        matched_invoice = None
        if match:
            raw_code = match.group(0)
            if "-" not in raw_code:
                raw_code = f"INV-{raw_code[3:9]}-{raw_code[9:]}"

            stmt = select(Invoice).where(
                Invoice.invoiceCode == raw_code,
                Invoice.deletedAt.is_(None),
            )
            res = await db.execute(stmt)
            matched_invoice = res.scalar_one_or_none()

        async with db.begin():
            event = WebhookEvent(
                provider=payload.provider.strip(),
                eventId=payload.eventId.strip(),
                payload={
                    "transactionId": payload.transactionId,
                    "amount": float(payload.amount),
                    "content": payload.content,
                    "transactionTime": str(payload.transactionTime),
                },
                status=WebhookEventStatus.UNMATCHED,
            )
            await webhook_repo.create(db, event)
            await db.flush()

            if matched_invoice and matched_invoice.status in [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]:
                # Create Idempotent Payment
                payment = Payment(
                    invoiceId=matched_invoice.id,
                    amount=payload.amount,
                    method=PaymentMethod.BANK_TRANSFER,
                    status=PaymentStatus.CONFIRMED,
                    paidAt=payload.transactionTime,
                    transactionRef=payload.transactionId,
                    note=f"Chuyển khoản tự động Webhook: {payload.content}",
                    refundAmount=Decimal(0),
                )
                await payment_repo.create(db, payment)
                await db.flush()

                event.matchedInvoiceId = matched_invoice.id
                event.matchedPaymentId = payment.id
                event.status = WebhookEventStatus.PROCESSED

                # Recalculate Invoice Ledger
                await ledger_service.recalculate_invoice_ledger(db, matched_invoice.id)

        return event

    async def get_unmatched_webhooks(self, db: AsyncSession) -> List[WebhookEvent]:
        return await webhook_repo.get_unmatched_webhooks(db)

    async def match_unmatched_webhook(
        self, db: AsyncSession, owner_id: str, event_id: str, body: WebhookMatchSchema
    ) -> WebhookEvent:
        event = await webhook_repo.get_by_provider_and_event_id(db, "SEPAY", event_id)
        if not event:
            stmt = select(WebhookEvent).where(WebhookEvent.id == event_id)
            res = await db.execute(stmt)
            event = res.scalar_one_or_none()

        if not event or event.status != WebhookEventStatus.UNMATCHED:
            raise BusinessException(
                code="WEBHOOK_ALREADY_MATCHED",
                message="Sự kiện chuyển khoản không tồn tại hoặc đã được xử lý thành công trước đó",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        invoice = await invoice_repo.get_by_id(db, body.invoiceId, owner_id, lock=True)
        if not invoice:
            raise BusinessException(
                code="INVOICE_NOT_FOUND",
                message="Hóa đơn không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        amount_val = Decimal(str(event.payload.get("amount", 0)))
        tx_id = str(event.payload.get("transactionId", event.id))

        async with db.begin():
            payment = Payment(
                invoiceId=invoice.id,
                amount=amount_val,
                method=PaymentMethod.BANK_TRANSFER,
                status=PaymentStatus.CONFIRMED,
                paidAt=datetime.now(),
                transactionRef=tx_id,
                note=f"Ghép nối thủ công giao dịch chuyển khoản từ Webhook event {event.eventId}",
                refundAmount=Decimal(0),
            )
            await payment_repo.create(db, payment)
            await db.flush()

            event.matchedInvoiceId = invoice.id
            event.matchedPaymentId = payment.id
            event.status = WebhookEventStatus.PROCESSED

            # Recalculate Invoice Ledger
            await ledger_service.recalculate_invoice_ledger(db, invoice.id)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="MANUAL_MATCH_WEBHOOK",
                entity="WebhookEvent",
                entity_id=event.id,
                details=f"Ghép nối giao dịch chuyển khoản {amount_val:,.0f}đ vào hóa đơn {invoice.invoiceCode}",
            )

        return event
