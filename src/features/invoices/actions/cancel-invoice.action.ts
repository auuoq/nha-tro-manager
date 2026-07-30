"use server";

import { cancelInvoiceService } from "../services/cancel-invoice.service";

export async function cancelInvoiceAction(invoiceId: string, cancellationReason: string) {
  try {
    const invoice = await cancelInvoiceService(invoiceId, cancellationReason);
    return { success: true, data: invoice };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CANCEL_INVOICE_FAILED";
    return { success: false, error: message };
  }
}
