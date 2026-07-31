from datetime import datetime
from decimal import Decimal
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.payment_repository import PaymentRepository
from app.repositories.audit_log_repository import create_audit_log
from app.services.payment_ledger_service import PaymentLedgerService
from app.models.payment import Payment
from app.models.enums import PaymentStatus
from app.schemas.payment import PaymentRefundSchema
from app.core.exceptions import BusinessException

payment_repo = PaymentRepository()
ledger_service = PaymentLedgerService()

class PaymentRefundService:
    async def refund_payment(
        self, db: AsyncSession, owner_id: str, payment_id: str, body: PaymentRefundSchema
    ) -> Payment:
        async with db.begin():
            payment = await payment_repo.get_by_id(db, payment_id, owner_id, lock=True)
            if not payment:
                raise BusinessException(
                    code="PAYMENT_NOT_FOUND",
                    message="Giao dịch thanh toán không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if payment.status not in [PaymentStatus.CONFIRMED, PaymentStatus.PARTIALLY_REFUNDED]:
                raise BusinessException(
                    code="PAYMENT_NOT_REFUNDABLE",
                    message="Chỉ được phép HOÀN TIỀN giao dịch ở trạng thái CONFIRMED hoặc PARTIALLY_REFUNDED",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            new_total_refund = payment.refundAmount + body.amount
            if new_total_refund > payment.amount:
                raise BusinessException(
                    code="REFUND_EXCEEDS_PAYMENT",
                    message=f"Tổng số tiền hoàn ({new_total_refund}) vượt quá số tiền thanh toán ban đầu ({payment.amount})",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            payment.refundAmount = new_total_refund
            if new_total_refund == payment.amount:
                payment.status = PaymentStatus.REFUNDED
            else:
                payment.status = PaymentStatus.PARTIALLY_REFUNDED

            # Recalculate Invoice Ledger
            await ledger_service.recalculate_invoice_ledger(db, payment.invoiceId)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="REFUND_PAYMENT",
                entity="Payment",
                entity_id=payment.id,
                details=f"Hoàn tiền {body.amount:,.0f}đ cho giao dịch {payment.id}. Lý do: {body.reason}",
            )

        return payment
