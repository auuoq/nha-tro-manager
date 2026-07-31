from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import require_tenant
from app.models.user import User
from app.services.tenant_service import TenantService
from app.repositories.contract_repository import ContractRepository
from app.repositories.invoice_repository import InvoiceRepository
from app.schemas.invoice import InvoiceResponseSchema
from app.schemas.invoice_item import InvoiceItemResponseSchema
from app.schemas.common import APIResponse
from app.core.exceptions import BusinessException

router = APIRouter(prefix="/tenant/invoices", tags=["Tenant Invoices"])
tenant_service = TenantService()
contract_repo = ContractRepository()
invoice_repo = InvoiceRepository()

@router.get("", response_model=APIResponse[List[InvoiceResponseSchema]])
async def get_tenant_invoices(
    current_user: User = Depends(require_tenant),
    db: AsyncSession = Depends(get_db),
):
    tenant = await tenant_service.get_tenant_self_profile(db, current_user)
    active_contracts = await contract_repo.get_tenant_active_contracts(db, tenant.id)
    contract_ids = [c.id for c in active_contracts]

    invoices = await invoice_repo.get_tenant_invoices(db, contract_ids)

    response_items = []
    for inv in invoices:
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
                sortOrder=item.sortOrder,
            )
            for item in (inv.items or [])
        ]
        response_items.append(
            InvoiceResponseSchema(
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
                previousOutstandingAmount=Decimal(0),
                status=inv.status,
                items=item_dtos,
                createdAt=inv.createdAt,
                updatedAt=inv.updatedAt,
            )
        )

    return APIResponse(
        success=True,
        data=response_items,
        message="Lấy danh sách hóa đơn cần thanh toán thành công",
    )

@router.get("/{invoice_id}", response_model=APIResponse[InvoiceResponseSchema])
async def get_tenant_invoice_detail(
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
            message="Bạn không có quyền truy cập hóa đơn này",
            status_code=status.HTTP_403_FORBIDDEN,
        )

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
            sortOrder=item.sortOrder,
        )
        for item in (invoice.items or [])
    ]

    return APIResponse(
        success=True,
        data=InvoiceResponseSchema(
            id=invoice.id,
            invoiceCode=invoice.invoiceCode,
            roomId=invoice.roomId,
            roomNumber=invoice.room.roomNumber if invoice.room else None,
            buildingName=invoice.room.building.name if invoice.room and invoice.room.building else None,
            contractId=invoice.contractId,
            billingPeriod=invoice.billingPeriod,
            revision=invoice.revision,
            issuedAt=invoice.issuedAt,
            dueDate=invoice.dueDate,
            subtotalAmount=invoice.subtotalAmount,
            discountAmount=invoice.discountAmount,
            totalAmount=invoice.totalAmount,
            paidAmount=invoice.paidAmount,
            remainingAmount=invoice.remainingAmount,
            previousOutstandingAmount=Decimal(0),
            status=invoice.status,
            items=item_dtos,
            createdAt=invoice.createdAt,
            updatedAt=invoice.updatedAt,
        ),
        message="Lấy chi tiết hóa đơn thanh toán thành công",
    )
