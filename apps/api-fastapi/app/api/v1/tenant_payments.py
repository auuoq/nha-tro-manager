from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_tenant
from app.models.user import User
from app.services.tenant_service import TenantService
from app.repositories.contract_repository import ContractRepository
from app.repositories.invoice_repository import InvoiceRepository
from app.repositories.payment_repository import PaymentRepository
from app.schemas.payment import PaymentResponseSchema
from app.schemas.common import APIResponse
from app.core.exceptions import BusinessException

router = APIRouter(prefix="/tenant", tags=["Tenant Payments"])
tenant_service = TenantService()
contract_repo = ContractRepository()
invoice_repo = InvoiceRepository()
payment_repo = PaymentRepository()

def build_tenant_payment_dto(p) -> PaymentResponseSchema:
    amount_int = int(p.amount) if p.amount else 0
    refund_int = int(p.refundAmount) if p.refundAmount else 0
    net_int = amount_int - refund_int

    masked_ref = None
    if p.transactionRef:
        ref_str = str(p.transactionRef)
        masked_ref = f"******{ref_str[-4:]}" if len(ref_str) >= 4 else "******"

    return PaymentResponseSchema(
        id=p.id,
        invoiceId=p.invoiceId,
        amount=amount_int,
        method=p.method,
        status=p.status,
        paidAt=p.paidAt,
        transactionRef=None,  # Unexposed raw transactionRef for security
        maskedTransactionRef=masked_ref,
        refundAmount=refund_int,
        netAmount=net_int,
        note=p.note,
        cancelledAt=p.cancelledAt,
        createdAt=p.createdAt,
    )

@router.get("/invoices/{invoice_id}/payments", response_model=APIResponse[List[PaymentResponseSchema]])
async def get_tenant_invoice_payments(
    invoice_id: str,
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_self_profile(db, current_user)
    active_contracts = await contract_repo.get_tenant_active_contracts(db, tenant.id)
    contract_ids = [c.id for c in active_contracts]

    invoice = await invoice_repo.get_by_id(db, invoice_id)
    if not invoice or invoice.contractId not in contract_ids:
        raise BusinessException(
            code="FORBIDDEN_RESOURCE_ACCESS",
            message="Bạn không có quyền truy cập thông tin thanh toán của hóa đơn này",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    payments = await payment_repo.get_tenant_payments_by_invoice(db, invoice_id)
    return APIResponse(
        success=True,
        data=[build_tenant_payment_dto(p) for p in payments],
        message="Lấy lịch sử thanh toán của hóa đơn thành công",
    )

@router.get("/payments", response_model=APIResponse[List[PaymentResponseSchema]])
async def get_tenant_all_payments(
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_self_profile(db, current_user)
    active_contracts = await contract_repo.get_tenant_active_contracts(db, tenant.id)
    contract_ids = [c.id for c in active_contracts]

    invoices = await invoice_repo.get_tenant_invoices(db, contract_ids)
    all_payments = []
    for inv in invoices:
        p_list = await payment_repo.get_tenant_payments_by_invoice(db, inv.id)
        all_payments.extend(p_list)

    all_payments.sort(key=lambda p: p.paidAt, reverse=True)

    return APIResponse(
        success=True,
        data=[build_tenant_payment_dto(p) for p in all_payments],
        message="Lấy lịch sử tất cả thanh toán cá nhân thành công",
    )
