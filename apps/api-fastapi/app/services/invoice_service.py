from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Tuple
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.repositories.invoice_repository import InvoiceRepository
from app.repositories.contract_repository import ContractRepository
from app.repositories.audit_log_repository import create_audit_log
from app.services.charge_resolution_service import ChargeResolutionService
from app.services.invoice_calculation_service import InvoiceCalculationService
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.enums import InvoiceStatus, ChargeType, ChargeMethod, InvoiceItemType, ContractStatus, MeterType
from app.schemas.invoice import InvoiceDraftCreateSchema, InvoiceDiscountSchema
from app.schemas.invoice_item import InvoiceItemCreateSchema, InvoiceItemUpdateSchema
from app.core.exceptions import BusinessException

invoice_repo = InvoiceRepository()
contract_repo = ContractRepository()
charge_resolver = ChargeResolutionService()
invoice_calculator = InvoiceCalculationService()

class InvoiceService:
    async def get_invoices_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        building_id: Optional[str] = None,
        contract_id: Optional[str] = None,
        status_filter: Optional[InvoiceStatus] = None,
        period: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Tuple[Invoice, str, str]], int]:
        return await invoice_repo.get_all_by_owner(
            db, owner_id, building_id=building_id, contract_id=contract_id, status=status_filter, period=period, page=page, page_size=page_size
        )

    async def get_invoice_detail(self, db: AsyncSession, owner_id: str, invoice_id: str) -> Invoice:
        invoice = await invoice_repo.get_by_id(db, invoice_id, owner_id)
        if not invoice:
            raise BusinessException(
                code="INVOICE_NOT_FOUND",
                message="Hóa đơn không tồn tại hoặc bạn không có quyền truy cập",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return invoice

    async def create_draft_invoice(self, db: AsyncSession, owner_id: str, body: InvoiceDraftCreateSchema) -> Invoice:
        contract = await contract_repo.get_by_id(db, body.contractId, owner_id)
        if not contract or contract.status != ContractStatus.ACTIVE:
            raise BusinessException(
                code="CONTRACT_NOT_ACTIVE",
                message="Hợp đồng phải ở trạng thái ACTIVE mới được lập hóa đơn thanh toán",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Check existing active invoice for period
        existing = await invoice_repo.get_active_invoice_by_contract_and_period(db, body.contractId, body.billingPeriod)
        if existing:
            raise BusinessException(
                code="INVOICE_ALREADY_EXISTS_FOR_PERIOD",
                message=f"Đã tồn tại hóa đơn (mã {existing.invoiceCode}) cho kỳ {body.billingPeriod}",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        due_datetime = datetime.combine(body.dueDate, datetime.min.time())
        inv_code = await invoice_repo.generate_invoice_code(db)

        # Calculate previous outstanding sum
        prev_outstanding = await invoice_repo.calculate_previous_outstanding(db, body.contractId)

        async with db.begin():
            invoice = Invoice(
                invoiceCode=inv_code,
                roomId=contract.roomId,
                contractId=body.contractId,
                billingPeriod=body.billingPeriod.strip(),
                revision=1,
                dueDate=due_datetime,
                subtotalAmount=Decimal(0),
                discountAmount=Decimal(0),
                totalAmount=Decimal(0),
                paidAmount=Decimal(0),
                remainingAmount=Decimal(0),
                status=InvoiceStatus.DRAFT,
            )
            await invoice_repo.create(db, invoice)
            await db.flush()

            # Create Room Rent Item
            room_item = InvoiceItem(
                invoiceId=invoice.id,
                type=InvoiceItemType.ROOM,
                description=f"Tiền thuê phòng kỳ {body.billingPeriod}",
                quantity=Decimal(1),
                unit="tháng",
                unitPrice=contract.monthlyPrice,
                amount=contract.monthlyPrice,
                sortOrder=1,
            )
            db.add(room_item)

            subtotal = contract.monthlyPrice
            sort_seq = 2

            # Auto Resolve Utility Charge Configs (Electricity, Water, Wifi, Garbage, Parking)
            for c_type in [ChargeType.ELECTRICITY, ChargeType.WATER, ChargeType.WIFI, ChargeType.GARBAGE, ChargeType.PARKING]:
                try:
                    config = await charge_resolver.resolve_charge_config(
                        db=db,
                        charge_type=c_type,
                        target_date=body.cutoffDate,
                        contract_id=contract.id,
                        room_id=contract.roomId,
                        building_id=contract.room.buildingId if contract.room else None,
                    )
                except BusinessException:
                    continue  # Skip optional unconfigured charges

                if config.chargeMethod == ChargeMethod.FREE:
                    item_type = InvoiceItemType[c_type.name]
                    free_item = InvoiceItem(
                        invoiceId=invoice.id,
                        type=item_type,
                        description=f"Chi phí {c_type.value} (Miễn phí)",
                        quantity=Decimal(1),
                        unit="lần",
                        unitPrice=Decimal(0),
                        amount=Decimal(0),
                        sortOrder=sort_seq,
                    )
                    db.add(free_item)
                    sort_seq += 1

                elif config.chargeMethod == ChargeMethod.METERED:
                    m_type = MeterType[c_type.name]
                    consumption, reading_ids, sources = await invoice_calculator.get_total_consumption_for_period(
                        db, contract.roomId, body.billingPeriod, m_type
                    )
                    item_amount = consumption * config.unitPrice
                    unit_str = "kWh" if c_type == ChargeType.ELECTRICITY else "m³"
                    item_type = InvoiceItemType[c_type.name]

                    meter_item = InvoiceItem(
                        invoiceId=invoice.id,
                        type=item_type,
                        description=f"Chi phí {c_type.value} kỳ {body.billingPeriod} ({consumption} {unit_str})",
                        quantity=consumption,
                        unit=unit_str,
                        unitPrice=config.unitPrice,
                        amount=item_amount,
                        calculationMetadata={"readingIds": reading_ids, "sources": sources},
                        sortOrder=sort_seq,
                    )
                    db.add(meter_item)
                    subtotal += item_amount
                    sort_seq += 1

                elif config.chargeMethod == ChargeMethod.PER_PERSON:
                    tenant_count = await invoice_calculator.count_active_tenants_at_cutoff(db, contract.id, body.cutoffDate)
                    item_amount = Decimal(tenant_count) * config.unitPrice
                    item_type = InvoiceItemType[c_type.name]

                    person_item = InvoiceItem(
                        invoiceId=invoice.id,
                        type=item_type,
                        description=f"Chi phí {c_type.value} ({tenant_count} người x {config.unitPrice:,.0f}đ)",
                        quantity=Decimal(tenant_count),
                        unit="người",
                        unitPrice=config.unitPrice,
                        amount=item_amount,
                        calculationMetadata={"activeTenantsCount": tenant_count, "cutoffDate": str(body.cutoffDate)},
                        sortOrder=sort_seq,
                    )
                    db.add(person_item)
                    subtotal += item_amount
                    sort_seq += 1

                elif config.chargeMethod == ChargeMethod.PER_ROOM:
                    item_amount = config.unitPrice
                    item_type = InvoiceItemType[c_type.name]

                    room_charge_item = InvoiceItem(
                        invoiceId=invoice.id,
                        type=item_type,
                        description=f"Chi phí {c_type.value} (Cố định theo phòng)",
                        quantity=Decimal(1),
                        unit="phòng",
                        unitPrice=config.unitPrice,
                        amount=item_amount,
                        sortOrder=sort_seq,
                    )
                    db.add(room_charge_item)
                    subtotal += item_amount
                    sort_seq += 1

            invoice.subtotalAmount = subtotal
            invoice.totalAmount = subtotal
            invoice.remainingAmount = subtotal

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="CREATE_DRAFT_INVOICE",
                entity="Invoice",
                entity_id=invoice.id,
                details=f"Khởi tạo dự thảo hóa đơn {invoice.invoiceCode} cho kỳ {invoice.billingPeriod}",
            )

        return invoice

    async def apply_discount(
        self, db: AsyncSession, owner_id: str, invoice_id: str, body: InvoiceDiscountSchema
    ) -> Invoice:
        invoice = await self.get_invoice_detail(db, owner_id, invoice_id)
        if invoice.status != InvoiceStatus.DRAFT:
            raise BusinessException(
                code="INVOICE_NOT_DRAFT",
                message="Chỉ được phép áp dụng giảm giá trên hóa đơn DRAFT",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if body.discountAmount > invoice.subtotalAmount:
            raise BusinessException(
                code="DISCOUNT_EXCEEDS_SUBTOTAL",
                message=f"Số tiền giảm giá ({body.discountAmount}) vượt quá tổng tiền chưa giảm ({invoice.subtotalAmount})",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        async with db.begin():
            invoice.discountAmount = body.discountAmount
            invoice.totalAmount = invoice.subtotalAmount - body.discountAmount
            invoice.remainingAmount = invoice.totalAmount
            invoice.notes = f"Giảm giá: {body.reason.strip()}"

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="APPLY_INVOICE_DISCOUNT",
                entity="Invoice",
                entity_id=invoice.id,
                details=f"Áp dụng giảm giá {body.discountAmount:,.0f}đ vào hóa đơn {invoice.invoiceCode}. Lý do: {body.reason}",
            )

        return invoice

    async def add_manual_item(
        self, db: AsyncSession, owner_id: str, invoice_id: str, body: InvoiceItemCreateSchema
    ) -> InvoiceItem:
        invoice = await self.get_invoice_detail(db, owner_id, invoice_id)
        if invoice.status != InvoiceStatus.DRAFT:
            raise BusinessException(
                code="INVOICE_NOT_DRAFT",
                message="Chỉ được phép thêm mục chi phí vào hóa đơn DRAFT",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        amount = body.quantity * body.unitPrice

        async with db.begin():
            item = InvoiceItem(
                invoiceId=invoice_id,
                type=body.type,
                description=body.description.strip(),
                quantity=body.quantity,
                unit=body.unit.strip(),
                unitPrice=body.unitPrice,
                amount=amount,
                sortOrder=body.sortOrder,
            )
            db.add(item)
            await db.flush()

            # Recalculate totals
            invoice.subtotalAmount += amount
            invoice.totalAmount = invoice.subtotalAmount - invoice.discountAmount
            invoice.remainingAmount = invoice.totalAmount

            await create_audit_log(
                db=db,
                user_id=owner_id,
                action="ADD_INVOICE_ITEM",
                entity="InvoiceItem",
                entity_id=item.id,
                details=f"Thêm mục chi phí '{item.description}' ({amount:,.0f}đ) vào hóa đơn {invoice.invoiceCode}",
            )

        return item
