"use server";

import { reissueInvoiceService } from "../services/reissue-invoice.service";

export async function reissueInvoiceAction(cancelledInvoiceId: string) {
  try {
    const invoice = await reissueInvoiceService(cancelledInvoiceId);
    return { success: true, data: invoice };
  } catch (error) {
    const message = error instanceof Error ? error.message : "REISSUE_INVOICE_FAILED";
    return { success: false, error: message };
  }
}
