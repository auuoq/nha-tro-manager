from datetime import datetime
from decimal import Decimal
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.invoice_repository import InvoiceRepository
from app.repositories.audit_log_repository import create_audit_log
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.enums import InvoiceStatus
from app.schemas.invoice import InvoiceCancelSchema
from app.core.exceptions import BusinessException

invoice_repo = InvoiceRepository()

class InvoiceLifecycleService:
    async def issue_invoice(self, db: AsyncSession, owner_id: str, invoice_id: str) -> Invoice:
        async with db.begin():
            invoice = await invoice_repo.get_by_id(db, invoice_id, owner_id, lock=True)
            if not invoice:
                raise BusinessException(
                    code="INVOICE_NOT_FOUND",
                    message="Hóa đơn không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if invoice.status != InvoiceStatus.DRAFT:
                raise BusinessException(
                    code="INVOICE_NOT_DRAFT",
                    message=f"Chỉ có thể phát hành (ISSUE) hóa đơn ở trạng thái DRAFT. Trạng thái hiện tại: {invoice.status.value}",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            if not invoice.items:
                raise BusinessException(
                    code="INVOICE_ITEMS_EMPTY",
                    message="Không thể phát hành hóa đơn không có mục chi phí nào",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            invoice.status = InvoiceStatus.ISSUED
            invoice.issuedAt = datetime.now()
            invoice.remainingAmount = invoice.totalAmount

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="ISSUE_INVOICE",
                entity="Invoice",
                entity_id=invoice.id,
                details=f"Phát hành chính thức hóa đơn {invoice.invoiceCode} cho kỳ {invoice.billingPeriod} với tổng tiền {invoice.totalAmount:,.0f}đ",
            )

        return invoice

    async def cancel_invoice(
        self, db: AsyncSession, owner_id: str, invoice_id: str, body: InvoiceCancelSchema
    ) -> Invoice:
        async with db.begin():
            invoice = await invoice_repo.get_by_id(db, invoice_id, owner_id, lock=True)
            if not invoice:
                raise BusinessException(
                    code="INVOICE_NOT_FOUND",
                    message="Hóa đơn không tồn tại hoặc không thuộc quyền sở hữu của bạn",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if invoice.paidAmount > Decimal(0):
                raise BusinessException(
                    code="INVOICE_HAS_PAYMENTS",
                    message="Không thể hủy hóa đơn đã có khoản thanh toán được xác nhận",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            invoice.status = InvoiceStatus.CANCELLED
            invoice.cancellationReason = body.reason.strip()

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CANCEL_INVOICE",
                entity="Invoice",
                entity_id=invoice.id,
                details=f"Hủy hóa đơn {invoice.invoiceCode}. Lý do: {invoice.cancellationReason}",
            )

        return invoice

    async def reissue_invoice(self, db: AsyncSession, owner_id: str, invoice_id: str) -> Invoice:
        async with db.begin():
            old_invoice = await invoice_repo.get_by_id(db, invoice_id, owner_id, lock=True)
            if not old_invoice:
                raise BusinessException(
                    code="INVOICE_NOT_FOUND",
                    message="Hóa đơn không tồn tại",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            if old_invoice.status != InvoiceStatus.CANCELLED:
                raise BusinessException(
                    code="INVOICE_NOT_CANCELLED",
                    message="Chỉ có thể phát hành lại (REISSUE) hóa đơn bị HỦY (CANCELLED)",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            new_code = await invoice_repo.generate_invoice_code(db)
            new_revision = old_invoice.revision + 1

            new_invoice = Invoice(
                invoiceCode=new_code,
                roomId=old_invoice.roomId,
                contractId=old_invoice.contractId,
                billingPeriod=old_invoice.billingPeriod,
                revision=new_revision,
                dueDate=old_invoice.dueDate,
                subtotalAmount=old_invoice.subtotalAmount,
                discountAmount=old_invoice.discountAmount,
                totalAmount=old_invoice.totalAmount,
                paidAmount=Decimal(0),
                remainingAmount=old_invoice.totalAmount,
                status=InvoiceStatus.DRAFT,
                replacedInvoiceId=old_invoice.id,
            )
            await invoice_repo.create(db, new_invoice)
            await db.flush()

            # Copy Snapshot InvoiceItems
            if old_invoice.items:
                for item in old_invoice.items:
                    new_item = InvoiceItem(
                        invoiceId=new_invoice.id,
                        type=item.type,
                        description=item.description,
                        quantity=item.quantity,
                        unit=item.unit,
                        unitPrice=item.unitPrice,
                        amount=item.amount,
                        meterReadingId=item.meterReadingId,
                        previousReading=item.previousReading,
                        currentReading=item.currentReading,
                        calculationMetadata=item.calculationMetadata,
                        sortOrder=item.sortOrder,
                    )
                    db.add(new_item)

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="REISSUE_INVOICE",
                entity="Invoice",
                entity_id=new_invoice.id,
                details=f"Phát hành lại hóa đơn mới {new_invoice.invoiceCode} (Revision {new_revision}) từ hóa đơn cũ bị hủy {old_invoice.invoiceCode}",
            )

        return new_invoice
