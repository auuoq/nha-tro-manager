import { getServerSession } from "@/server/auth/session";
import { prisma } from "@/server/database/prisma";
import { InvoiceStatus } from "@prisma/client";

// VietQR URL format: https://img.vietqr.io/image/{bankBin}-{accountNo}-{template}.png?amount={amount}&addInfo={content}&accountName={name}
const VIETQR_BASE_URL = "https://img.vietqr.io/image";

export interface VietQRResult {
  qrUrl: string;
  bankAccountNo: string;
  bankAccountName: string;
  amount: number;
  content: string;
}

export async function generateInvoiceVietQRService(invoiceId: string): Promise<VietQRResult> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");

  // Load invoice with authorization context
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      room: {
        select: {
          building: {
            select: {
              ownerId: true,
              bankBin: true,
              bankAccountNo: true,
              bankAccountName: true,
            },
          },
        },
      },
      contract: {
        select: {
          contractTenants: {
            where: { leftAt: null },
            select: { tenantId: true },
          },
        },
      },
    },
  });

  if (!invoice) throw new Error("NOT_FOUND_INVOICE");

  // Authorization: Owner or active Tenant of this contract
  const isOwner = session.user.role === "OWNER" && invoice.room.building.ownerId === session.user.id;
  const isTenant =
    session.user.role === "TENANT" &&
    invoice.contract.contractTenants.some((ct) => ct.tenantId === session.user.id);

  if (!isOwner && !isTenant) {
    throw new Error("FORBIDDEN_VIETQR_ACCESS");
  }

  // Only generate QR for payable statuses
  const payableStatuses: InvoiceStatus[] = [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE];
  if (!payableStatuses.includes(invoice.status)) {
    throw new Error(`CANNOT_GENERATE_VIETQR_FOR_STATUS_${invoice.status}: Chỉ có thể tạo VietQR cho hóa đơn chưa thanh toán đầy đủ.`);
  }

  const remainingAmount = Number(invoice.remainingAmount);
  if (remainingAmount <= 0) {
    throw new Error("INVOICE_FULLY_PAID: Hóa đơn đã thanh toán đầy đủ.");
  }

  const { bankBin, bankAccountNo, bankAccountName } = invoice.room.building;

  if (!bankBin || !bankAccountNo || !bankAccountName) {
    throw new Error("BANK_CONFIG_MISSING: Tòa nhà chưa cấu hình thông tin ngân hàng để nhận thanh toán.");
  }

  // Build VietQR URL - use invoiceCode as content (no PII)
  const content = encodeURIComponent(invoice.invoiceCode);
  const accountName = encodeURIComponent(bankAccountName);
  const qrUrl = `${VIETQR_BASE_URL}/${bankBin}-${bankAccountNo}-compact.png?amount=${remainingAmount}&addInfo=${content}&accountName=${accountName}`;

  return {
    qrUrl,
    bankAccountNo,
    bankAccountName,
    amount: remainingAmount,
    content: invoice.invoiceCode,
  };
}
