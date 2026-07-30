import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { InvoiceStatus } from "@prisma/client";

export async function cancelInvoiceService(invoiceId: string, cancellationReason: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  if (!cancellationReason || cancellationReason.trim().length === 0) {
    throw new Error("CANCELLATION_REASON_REQUIRED: Vui lòng nhập lý do hủy hóa đơn.");
  }

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

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("CANNOT_CANCEL_PAID_INVOICE: Không thể hủy hóa đơn đã được thanh toán đầy đủ.");
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("INVOICE_ALREADY_CANCELLED: Hóa đơn đã bị hủy trước đó.");
    }

    if (invoice.status !== InvoiceStatus.ISSUED && invoice.status !== InvoiceStatus.OVERDUE) {
      throw new Error("CANNOT_CANCEL_INVOICE: Chỉ có thể hủy Hóa đơn ở trạng thái ISSUED hoặc OVERDUE.");
    }

    // Check for existing confirmed payments
    const payments = await tx.payment.findMany({
      where: {
        invoiceId,
        status: "CONFIRMED",
      },
    });

    if (payments.length > 0) {
      throw new Error("INVOICE_HAS_PAYMENTS: Hóa đơn đã có thanh toán xác nhận. Cần xử lý hoàn tiền trước khi hủy.");
    }

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.CANCELLED,
        cancellationReason: cancellationReason.trim(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CANCEL_INVOICE",
        entity: "Invoice",
        entityId: invoiceId,
        details: JSON.stringify({
          invoiceCode: invoice.invoiceCode,
          cancellationReason: cancellationReason.trim(),
        }),
      },
    });

    return updated;
  });
}
