from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.payment_repository import PaymentRepository
from app.repositories.invoice_repository import InvoiceRepository
from app.models.enums import InvoiceStatus, PaymentStatus

payment_repo = PaymentRepository()
invoice_repo = InvoiceRepository()

class PaymentLedgerService:
    async def recalculate_invoice_ledger(self, db: AsyncSession, invoice_id: str) -> None:
        """Recalculates Invoice.paidAmount, Invoice.remainingAmount, Invoice.overpaymentAmount, and Invoice.status directly from the payment ledger."""
        invoice = await invoice_repo.get_by_id(db, invoice_id, lock=True)
        if not invoice:
            return

        valid_payments = await payment_repo.get_valid_payments_by_invoice(db, invoice_id)

        net_paid = Decimal(0)
        for p in valid_payments:
            net_paid += (p.amount - p.refundAmount)

        invoice.paidAmount = net_paid

        if net_paid >= invoice.totalAmount:
            invoice.remainingAmount = Decimal(0)
            invoice.overpaymentAmount = net_paid - invoice.totalAmount
            invoice.status = InvoiceStatus.PAID
        elif net_paid > Decimal(0):
            invoice.remainingAmount = invoice.totalAmount - net_paid
            invoice.overpaymentAmount = Decimal(0)
            invoice.status = InvoiceStatus.PARTIALLY_PAID
        else:
            invoice.remainingAmount = invoice.totalAmount
            invoice.overpaymentAmount = Decimal(0)
            if invoice.status not in [InvoiceStatus.DRAFT, InvoiceStatus.CANCELLED]:
                invoice.status = InvoiceStatus.ISSUED
