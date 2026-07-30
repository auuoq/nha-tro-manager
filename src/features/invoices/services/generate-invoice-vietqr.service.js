"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceVietQRService = generateInvoiceVietQRService;
const session_1 = require("@/server/auth/session");
const prisma_1 = require("@/server/database/prisma");
const client_1 = require("@prisma/client");
// VietQR URL format: https://img.vietqr.io/image/{bankBin}-{accountNo}-{template}.png?amount={amount}&addInfo={content}&accountName={name}
const VIETQR_BASE_URL = "https://img.vietqr.io/image";
async function generateInvoiceVietQRService(invoiceId) {
    const session = await (0, session_1.getServerSession)();
    if (!session?.user)
        throw new Error("UNAUTHORIZED");
    // Load invoice with authorization context
    const invoice = await prisma_1.prisma.invoice.findUnique({
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
    if (!invoice)
        throw new Error("NOT_FOUND_INVOICE");
    // Authorization: Owner or active Tenant of this contract
    const isOwner = session.user.role === "OWNER" && invoice.room.building.ownerId === session.user.id;
    const isTenant = session.user.role === "TENANT" &&
        invoice.contract.contractTenants.some((ct) => ct.tenantId === session.user.id);
    if (!isOwner && !isTenant) {
        throw new Error("FORBIDDEN_VIETQR_ACCESS");
    }
    // Only generate QR for payable statuses
    const payableStatuses = [client_1.InvoiceStatus.ISSUED, client_1.InvoiceStatus.PARTIALLY_PAID, client_1.InvoiceStatus.OVERDUE];
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
