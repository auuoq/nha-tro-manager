from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_owner
from app.models.user import User
from app.models.enums import InvoiceStatus
from app.services.invoice_service import InvoiceService
from app.services.invoice_lifecycle_service import InvoiceLifecycleService
from app.repositories.invoice_repository import InvoiceRepository
from app.schemas.invoice import (
    InvoiceDraftCreateSchema,
    InvoiceDiscountSchema,
    InvoiceCancelSchema,
    InvoiceResponseSchema,
)
from app.schemas.invoice_item import (
    InvoiceItemCreateSchema,
    InvoiceItemResponseSchema,
)
from app.schemas.pagination import PaginatedData
from app.schemas.common import APIResponse

router = APIRouter(prefix="/invoices", tags=["Invoices"])
invoice_service = InvoiceService()
lifecycle_service = InvoiceLifecycleService()
invoice_repo = InvoiceRepository()

def build_invoice_response(inv) -> InvoiceResponseSchema:
    item_dtos = []
    if inv.items:
        item_dtos = [
            InvoiceItemResponseSchema(
                id=item.id,
                invoiceId=item.invoiceId,
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
            for item in inv.items
        ]

    return InvoiceResponseSchema(
        id=inv.id,
        invoiceCode=inv.invoiceCode,
        roomId=inv.roomId,
        roomNumber=inv.room.roomNumber if inv.room else None,
        buildingName=inv.room.building.name if inv.room and inv.room.building else None,
        contractId=inv.contractId,
        billingPeriod=inv.billingPeriod,
        revision=inv.revision,
        issuedAt=inv.issuedAt,
        dueDate=inv.dueDate,
        subtotalAmount=inv.subtotalAmount,
        discountAmount=inv.discountAmount,
        totalAmount=inv.totalAmount,
        paidAmount=inv.paidAmount,
        remainingAmount=inv.remainingAmount,
        previousOutstandingAmount=getattr(inv, "previousOutstandingAmount", Decimal(0)),
        status=inv.status,
        replacedInvoiceId=inv.replacedInvoiceId,
        cancellationReason=inv.cancellationReason,
        notes=inv.notes,
        items=item_dtos,
        createdAt=inv.createdAt,
        updatedAt=inv.updatedAt,
    )

@router.get("", response_model=APIResponse[PaginatedData[InvoiceResponseSchema]])
async def get_invoices(
    buildingId: Optional[str] = Query(default=None),
    contractId: Optional[str] = Query(default=None),
    status: Optional[InvoiceStatus] = Query(default=None),
    period: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    items, total = await invoice_service.get_invoices_by_owner(
        db, current_user.id, building_id=buildingId, contract_id=contractId, status_filter=status, period=period, page=page, page_size=pageSize
    )
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 0

    response_items = []
    for inv, r_num, b_name in items:
        dto = build_invoice_response(inv)
        dto.roomNumber = r_num
        dto.buildingName = b_name
        response_items.append(dto)

    return APIResponse(
        success=True,
        data=PaginatedData(
            items=response_items,
            page=page,
            pageSize=pageSize,
            total=total,
            totalPages=total_pages,
        ),
        message="Lấy danh sách hóa đơn thành công",
    )

@router.post("/draft", response_model=APIResponse[InvoiceResponseSchema], status_code=status.HTTP_201_CREATED)
async def create_draft_invoice(
    body: InvoiceDraftCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    invoice = await invoice_service.create_draft_invoice(db, current_user.id, body)
    return APIResponse(
        success=True,
        data=build_invoice_response(invoice),
        message=f"Tạo dự thảo hóa đơn {invoice.invoiceCode} thành công",
    )

@router.get("/{invoice_id}", response_model=APIResponse[InvoiceResponseSchema])
async def get_invoice_detail(
    invoice_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    invoice = await invoice_service.get_invoice_detail(db, current_user.id, invoice_id)
    # Calculate previous outstanding dynamically for detail view
    prev_sum = await invoice_repo.calculate_previous_outstanding(db, invoice.contractId, current_invoice_id=invoice.id)
    dto = build_invoice_response(invoice)
    dto.previousOutstandingAmount = prev_sum
    return APIResponse(
        success=True,
        data=dto,
        message="Lấy chi tiết hóa đơn thành công",
    )

@router.post("/{invoice_id}/items", response_model=APIResponse[InvoiceItemResponseSchema], status_code=status.HTTP_201_CREATED)
async def add_invoice_item(
    invoice_id: str,
    body: InvoiceItemCreateSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    item = await invoice_service.add_manual_item(db, current_user.id, invoice_id, body)
    return APIResponse(
        success=True,
        data=InvoiceItemResponseSchema(
            id=item.id,
            invoiceId=item.invoiceId,
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
        ),
        message="Thêm mục chi phí mới thành công",
    )

@router.post("/{invoice_id}/discount", response_model=APIResponse[InvoiceResponseSchema])
async def apply_invoice_discount(
    invoice_id: str,
    body: InvoiceDiscountSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    invoice = await invoice_service.apply_discount(db, current_user.id, invoice_id, body)
    return APIResponse(
        success=True,
        data=build_invoice_response(invoice),
        message="Áp dụng giảm giá hóa đơn thành công",
    )

@router.post("/{invoice_id}/issue", response_model=APIResponse[InvoiceResponseSchema])
async def issue_invoice(
    invoice_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    invoice = await lifecycle_service.issue_invoice(db, current_user.id, invoice_id)
    return APIResponse(
        success=True,
        data=build_invoice_response(invoice),
        message=f"Phát hành hóa đơn {invoice.invoiceCode} thành công",
    )

@router.post("/{invoice_id}/cancel", response_model=APIResponse[InvoiceResponseSchema])
async def cancel_invoice(
    invoice_id: str,
    body: InvoiceCancelSchema,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    invoice = await lifecycle_service.cancel_invoice(db, current_user.id, invoice_id, body)
    return APIResponse(
        success=True,
        data=build_invoice_response(invoice),
        message=f"Hủy hóa đơn {invoice.invoiceCode} thành công",
    )

@router.post("/{invoice_id}/reissue", response_model=APIResponse[InvoiceResponseSchema])
async def reissue_invoice(
    invoice_id: str,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    new_invoice = await lifecycle_service.reissue_invoice(db, current_user.id, invoice_id)
    return APIResponse(
        success=True,
        data=build_invoice_response(new_invoice),
        message=f"Phát hành lại hóa đơn mới {new_invoice.invoiceCode} (Revision {new_invoice.revision}) thành công",
    )
