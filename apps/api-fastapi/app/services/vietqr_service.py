import urllib.parse
from decimal import Decimal
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.invoice_repository import InvoiceRepository
from app.models.enums import InvoiceStatus
from app.schemas.vietqr import VietQRResponseSchema
from app.core.exceptions import BusinessException

invoice_repo = InvoiceRepository()

class VietQRService:
    async def generate_vietqr_for_invoice(self, db: AsyncSession, invoice_id: str) -> VietQRResponseSchema:
        invoice = await invoice_repo.get_by_id(db, invoice_id)
        if not invoice:
            raise BusinessException(
                code="INVOICE_NOT_FOUND",
                message="Hóa đơn không tồn tại",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if invoice.status not in [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] or invoice.remainingAmount <= Decimal(0):
            raise BusinessException(
                code="INVOICE_ALREADY_PAID",
                message="Hóa đơn đã được thanh toán hoàn tất hoặc không trong trạng thái chờ thanh toán",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        building = invoice.room.building if invoice.room else None
        if not building or not building.bankName or not building.bankAccount:
            raise BusinessException(
                code="BANK_CONFIG_MISSING",
                message="Tòa nhà chưa được cấu hình tài khoản ngân hàng nhận thanh toán",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        bank_id = building.bankName.strip()
        account_no = building.bankAccount.strip()
        account_name = building.bankOwner.strip() if building.bankOwner else "CHU NHA"
        amount_int = int(invoice.remainingAmount)
        content_str = invoice.invoiceCode

        # Generate VietQR QuickLink (https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>)
        encoded_name = urllib.parse.quote(account_name)
        encoded_content = urllib.parse.quote(content_str)
        quick_link = f"https://img.vietqr.io/image/{bank_id}-{account_no}-compact2.png?amount={amount_int}&addInfo={encoded_content}&accountName={encoded_name}"
        qr_payload = f"00020101021238570010A000000727012500069704230111{account_no}530370454{amount_int}5802VN62150811{content_str}6304"

        return VietQRResponseSchema(
            invoiceId=invoice.id,
            invoiceCode=invoice.invoiceCode,
            bankId=bank_id,
            bankName=bank_id,
            accountNo=account_no,
            accountName=account_name,
            amount=amount_int,
            content=content_str,
            qrDataURL=quick_link,
            qrQuickLink=quick_link,
        )
