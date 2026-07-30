import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { addManualInvoiceItemSchema, AddManualInvoiceItemInput } from "../schemas/invoice-item.schema";
import { InvoiceStatus, InvoiceItemType } from "@prisma/client";

export async function addManualInvoiceItemService(input: AddManualInvoiceItemInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = addManualInvoiceItemSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: validated.invoiceId },
      include: {
        room: { select: { building: { select: { ownerId: true } } } },
        items: true,
      },
    });

    if (!invoice || invoice.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_INVOICE_OWNER");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error("CANNOT_MODIFY_NON_DRAFT_INVOICE: Chỉ được sửa khoản thu khi Hóa đơn ở trạng thái DRAFT.");
    }

    const amount = validated.quantity * validated.unitPrice;
    const maxSort = invoice.items.reduce((max, i) => Math.max(max, i.sortOrder), 0);

    const newItem = await tx.invoiceItem.create({
      data: {
        invoiceId: validated.invoiceId,
        type: InvoiceItemType.OTHER,
        description: validated.description,
        quantity: validated.quantity,
        unit: validated.unit || "khoản",
        unitPrice: validated.unitPrice,
        amount,
        sortOrder: maxSort + 1,
        calculationMetadata: { addedBy: session.user.id, manual: true },
      },
    });

    // Recalculate totals
    const updatedItems = await tx.invoiceItem.findMany({ where: { invoiceId: validated.invoiceId } });
    const subtotalAmount = updatedItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const discountAmount = Number(invoice.discountAmount);
    const totalAmount = Math.max(0, subtotalAmount - discountAmount);

    await tx.invoice.update({
      where: { id: validated.invoiceId },
      data: {
        subtotalAmount,
        totalAmount,
        remainingAmount: totalAmount,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADD_MANUAL_INVOICE_ITEM",
        entity: "InvoiceItem",
        entityId: newItem.id,
        details: JSON.stringify({ invoiceId: invoice.id, description: newItem.description, amount }),
      },
    });

    return newItem;
  });
}

export async function applyInvoiceDiscountService(invoiceId: string, discountAmount: number, reason?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  if (discountAmount < 0) throw new Error("INVALID_DISCOUNT_AMOUNT: Mức giảm giá không được âm.");

  return runSerializableTransaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        room: { select: { building: { select: { ownerId: true } } } },
      },
    });

    if (!invoice || invoice.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_INVOICE_OWNER");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error("CANNOT_MODIFY_NON_DRAFT_INVOICE: Chỉ được giảm giá khi Hóa đơn ở trạng thái DRAFT.");
    }

    const subtotalAmount = Number(invoice.subtotalAmount);
    if (discountAmount > subtotalAmount) {
      throw new Error(
        `DISCOUNT_EXCEEDS_SUBTOTAL: Mức giảm giá (${discountAmount.toLocaleString("vi-VN")}đ) vượt quá tổng tiền trước giảm giá (${subtotalAmount.toLocaleString("vi-VN")}đ).`
      );
    }

    const totalAmount = subtotalAmount - discountAmount;

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        discountAmount,
        totalAmount,
        remainingAmount: totalAmount,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "APPLY_INVOICE_DISCOUNT",
        entity: "Invoice",
        entityId: invoiceId,
        details: JSON.stringify({ discountAmount, reason: reason || null, totalAmount }),
      },
    });

    return updated;
  });
}
