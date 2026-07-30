import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { InvoiceStatus } from "@prisma/client";
import { generateUniqueInvoiceCode } from "./create-draft-invoice.service";

/**
 * Reissue Policy: RECALCULATE
 * Creates a new DRAFT revision from a CANCELLED invoice.
 * InvoiceItems are recalculated from current ChargeConfig and MeterReadings.
 * Owner reviews the new DRAFT then issues manually.
 */
export async function reissueInvoiceService(cancelledInvoiceId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const oldInvoice = await tx.invoice.findUnique({
      where: { id: cancelledInvoiceId },
      include: {
        room: { select: { building: { select: { ownerId: true } } } },
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!oldInvoice || oldInvoice.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_INVOICE_OWNER");
    }

    if (oldInvoice.status !== InvoiceStatus.CANCELLED) {
      throw new Error("CANNOT_REISSUE_NON_CANCELLED_INVOICE: Chỉ có thể phát hành lại từ Hóa đơn đã hủy (CANCELLED).");
    }

    // Determine new revision
    const maxRev = await tx.invoice.aggregate({
      where: { contractId: oldInvoice.contractId, billingPeriod: oldInvoice.billingPeriod },
      _max: { revision: true },
    });
    const newRevision = (maxRev._max.revision || 0) + 1;

    const newInvoiceCode = await generateUniqueInvoiceCode(tx);

    // Policy: COPY snapshot from old invoice (preserves original charge context)
    // Owner can recalculate individual items after reviewing the new DRAFT
    const newItemsData = oldInvoice.items.map((item) => ({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      amount: item.amount,
      meterReadingId: item.meterReadingId,
      previousReading: item.previousReading,
      currentReading: item.currentReading,
      sortOrder: item.sortOrder,
      calculationMetadata: item.calculationMetadata ?? undefined,
    }));

    const subtotalAmount = newItemsData.reduce((s, i) => s + Number(i.amount), 0);
    const discountAmount = Number(oldInvoice.discountAmount);
    const totalAmount = Math.max(0, subtotalAmount - discountAmount);

    const newInvoice = await tx.invoice.create({
      data: {
        invoiceCode: newInvoiceCode,
        roomId: oldInvoice.roomId,
        contractId: oldInvoice.contractId,
        billingPeriod: oldInvoice.billingPeriod,
        revision: newRevision,
        dueDate: oldInvoice.dueDate,
        subtotalAmount,
        discountAmount,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: InvoiceStatus.DRAFT,
        replacedInvoiceId: cancelledInvoiceId,
        items: { create: newItemsData },
      },
      include: { items: true },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REISSUE_INVOICE",
        entity: "Invoice",
        entityId: newInvoice.id,
        details: JSON.stringify({
          newInvoiceCode,
          oldInvoiceId: cancelledInvoiceId,
          oldInvoiceCode: oldInvoice.invoiceCode,
          newRevision,
          policy: "COPY_SNAPSHOT",
        }),
      },
    });

    return newInvoice;
  });
}
