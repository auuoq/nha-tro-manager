import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { InvoiceStatus } from "@prisma/client";

export async function issueInvoiceService(invoiceId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        room: {
          select: {
            deletedAt: true,
            building: { select: { ownerId: true, deletedAt: true } },
          },
        },
        contract: { select: { status: true } },
      },
    });

    if (!invoice || invoice.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_INVOICE_OWNER");
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error("CANNOT_ISSUE_NON_DRAFT_INVOICE: Chỉ có thể phát hành Hóa đơn ở trạng thái DRAFT.");
    }

    if (invoice.deletedAt) {
      throw new Error("INVOICE_ARCHIVED");
    }

    if (invoice.room.deletedAt) {
      throw new Error("ROOM_ARCHIVED: Phòng trọ đã bị archive, không thể phát hành hóa đơn.");
    }

    if (invoice.room.building.deletedAt) {
      throw new Error("BUILDING_ARCHIVED: Tòa nhà đã bị archive, không thể phát hành hóa đơn.");
    }

    if (invoice.contract.status !== "ACTIVE") {
      throw new Error("CONTRACT_NOT_ACTIVE: Hợp đồng không còn ở trạng thái ACTIVE.");
    }

    if (invoice.items.length === 0) {
      throw new Error("INVOICE_HAS_NO_ITEMS: Hóa đơn phải có ít nhất một khoản thu trước khi phát hành.");
    }

    if (Number(invoice.totalAmount) < 0) {
      throw new Error("INVOICE_INVALID_TOTAL: Tổng tiền hóa đơn không hợp lệ.");
    }

    const issuedAt = new Date();

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.ISSUED,
        issuedAt,
        remainingAmount: invoice.totalAmount,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ISSUE_INVOICE",
        entity: "Invoice",
        entityId: invoiceId,
        details: JSON.stringify({
          invoiceCode: invoice.invoiceCode,
          totalAmount: invoice.totalAmount,
          issuedAt,
        }),
      },
    });

    return updated;
  });
}
