"use server";

import { applyInvoiceDiscountService } from "../services/manage-manual-invoice-item.service";

export async function applyInvoiceDiscountAction(invoiceId: string, discountAmount: number, reason?: string) {
  try {
    const updated = await applyInvoiceDiscountService(invoiceId, discountAmount, reason);
    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "APPLY_DISCOUNT_FAILED";
    return { success: false, error: message };
  }
}
