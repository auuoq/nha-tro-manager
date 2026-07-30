"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePreviousOutstandingService = calculatePreviousOutstandingService;
async function calculatePreviousOutstandingService(tx, contractId, excludeInvoiceId) {
    const previousInvoices = await tx.invoice.findMany({
        where: {
            contractId,
            status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
            deletedAt: null,
            ...(excludeInvoiceId ? { id: { not: excludeInvoiceId } } : {}),
        },
        select: { remainingAmount: true },
    });
    const totalOutstanding = previousInvoices.reduce((sum, inv) => sum + Number(inv.remainingAmount), 0);
    return totalOutstanding;
}
