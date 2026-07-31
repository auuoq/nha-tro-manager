from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.payment_repository import PaymentRepository
from app.repositories.invoice_repository import InvoiceRepository
from app.repositories.audit_log_repository import create_audit_log
from app.services.payment_ledger_service import PaymentLedgerService
from app.models.payment import Payment
from app.models.enums import PaymentStatus, InvoiceStatus
from app.schemas.payment import PaymentManualCreateSchema, PaymentCancelSchema
from app.core.exceptions import BusinessException

payment_repo = PaymentRepository()
invoice_repo = InvoiceRepository()
ledger_service = PaymentLedgerService()

class PaymentService:
    async def get_payments_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        invoice_id: Optional[str] = None,
        building_id: Optional[str] = None,
        method: Optional[str] = None,
        status_filter: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Payment], int]:
        return await payment_repo.get_all_by_owner(
            db, owner_id, invoice_id=invoice_id, building_id=building_id, method=method, status=status_filter, from_date=from_date, to_date=to_date, page=page, page_size=page_size
        )

    async def get_payment_detail(self, db: AsyncSession, owner_id: str, payment_id: str) -> Payment:
        payment = await payment_repo.get_by_id(db, payment_id, owner_id)
        if not payment:
            raise BusinessException(
                code="PAYMENT_NOT_FOUND",
                message="Giao dịch thanh toán không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return payment

    async def create_manual_payment(self, db: AsyncSession, owner_id: str, body: PaymentManualCreateSchema) -> Payment:
        invoice = await invoice_repo.get_by_id(db, body.invoiceId, owner_id, lock=True)
        if not invoice:
            raise BusinessException(
                code="INVOICE_NOT_FOUND",
                message="Hóa đơn không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if invoice.status not in [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]:
            raise BusinessException(
                code="INVOICE_NOT_PAYABLE",
                message=f"Chỉ có thể ghi nhận thanh toán cho Hóa đơn ở trạng thái ISSUED, PARTIALLY_PAID hoặc OVERDUE. Trạng thái hiện tại: {invoice.status.value}",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            payment = Payment(
                invoiceId=body.invoiceId,
                amount=body.amount,
                method=body.method,
                status=PaymentStatus.CONFIRMED,
                paidAt=body.paidAt,
                transactionRef=body.transactionRef,
                note=body.note,
                refundAmount=Decimal(0),
            )
            await payment_repo.create(db, payment)
            await db.flush()

            # Recalculate Invoice Ledger
            await ledger_service.recalculate_invoice_ledger(db, invoice.id)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_MANUAL_PAYMENT",
                entity="Payment",
                entity_id=payment.id,
                details=f"Ghi nhận thanh toán thủ công {payment.amount:,.0f}đ ({payment.method.value}) cho hóa đơn {invoice.invoiceCode}",
            )

        return payment

    async def cancel_payment(
        self, db: AsyncSession, owner_id: str, payment_id: str, body: PaymentCancelSchema
    ) -> Payment:
        async with db.begin():
            payment = await payment_repo.get_by_id(db, payment_id, owner_id, lock=True)
            if not payment:
                raise BusinessException(
                    code="PAYMENT_NOT_FOUND",
                    message="Giao dịch thanh toán không tồn tại",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if payment.status != PaymentStatus.CONFIRMED:
                raise BusinessException(
                    code="PAYMENT_NOT_CANCELLABLE",
                    message=f"Chỉ được phép HỦY (CANCEL) giao dịch ở trạng thái CONFIRMED. Trạng thái hiện tại: {payment.status.value}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            payment.status = PaymentStatus.CANCELLED
            payment.cancelledAt = datetime.now()
            payment.note = f"Hủy thanh toán: {body.reason.strip()}"

            # Recalculate Invoice Ledger
            await ledger_service.recalculate_invoice_ledger(db, payment.invoiceId)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CANCEL_PAYMENT",
                entity="Payment",
                entity_id=payment.id,
                details=f"Hủy giao dịch thanh toán {payment.amount:,.0f}đ. Lý do: {body.reason}",
            )

        return payment
