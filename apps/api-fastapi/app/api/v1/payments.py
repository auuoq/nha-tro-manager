from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.models.enums import PaymentMethod, PaymentStatus
from app.services.payment_service import PaymentService
from app.services.payment_refund_service import PaymentRefundService
from app.schemas.payment import (
    PaymentManualCreateSchema,
    PaymentCancelSchema,
    PaymentRefundSchema,
    PaymentResponseSchema,
)
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/payments", tags=["Payments"])
payment_service = PaymentService()
refund_service = PaymentRefundService()

def build_payment_dto(p) -> PaymentResponseSchema:
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
        transactionRef=p.transactionRef,
        maskedTransactionRef=masked_ref,
        refundAmount=refund_int,
        netAmount=net_int,
        note=p.note,
        cancelledAt=p.cancelledAt,
        createdAt=p.createdAt,
    )

@router.get("", response_model=APIResponse[PaginatedData[PaymentResponseSchema]])
async def get_payments(
    invoiceId: Optional[str] = Query(default=None),
    buildingId: Optional[str] = Query(default=None),
    method: Optional[PaymentMethod] = Query(default=None),
    status: Optional[PaymentStatus] = Query(default=None),
    fromDate: Optional[datetime] = Query(default=None),
    toDate: Optional[datetime] = Query(default=None),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await payment_service.get_payments_by_owner(
        db, current_user.id, invoice_id=invoiceId, building_id=buildingId, method=method, status_filter=status, from_date=fromDate, to_date=toDate, page=page, page_size=pageSize
    )
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    return APIResponse(
        success=True,
        data=PaginatedData(
            items=[build_payment_dto(p) for p in items],
            page=page,
            pageSize=pageSize,
            total=total,
            totalPages=total_pages,
        ),
        message="Lấy danh sách giao dịch thanh toán thành công",
    )

@router.post("/manual", response_model=APIResponse[PaymentResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_manual_payment(
    body: PaymentManualCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    payment = await payment_service.create_manual_payment(db, current_user.id, body)
    return APIResponse(
        success=True,
        data=build_payment_dto(payment),
        message=f"Ghi nhận thanh toán {int(payment.amount):,}đ thành công",
    )

@router.get("/{payment_id}", response_model=APIResponse[PaymentResponseSchema])
async def get_payment_detail(
    payment_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    payment = await payment_service.get_payment_detail(db, current_user.id, payment_id)
    return APIResponse(
        success=True,
        data=build_payment_dto(payment),
        message="Lấy chi tiết giao dịch thanh toán thành công",
    )

@router.post("/{payment_id}/cancel", response_model=APIResponse[PaymentResponseSchema])
async def cancel_payment(
    payment_id: str,
    body: PaymentCancelSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    payment = await payment_service.cancel_payment(db, current_user.id, payment_id, body)
    return APIResponse(
        success=True,
        data=build_payment_dto(payment),
        message="Hủy giao dịch thanh toán thành công",
    )

@router.post("/{payment_id}/refund", response_model=APIResponse[PaymentResponseSchema])
async def refund_payment(
    payment_id: str,
    body: PaymentRefundSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    payment = await refund_service.refund_payment(db, current_user.id, payment_id, body)
    return APIResponse(
        success=True,
        data=build_payment_dto(payment),
        message=f"Hoàn tiền {int(body.amount):,}đ thành công",
    )
