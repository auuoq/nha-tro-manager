"use server";

import { issueInvoiceService } from "../services/issue-invoice.service";

export async function issueInvoiceAction(invoiceId: string) {
  try {
    const invoice = await issueInvoiceService(invoiceId);
    return { success: true, data: invoice };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ISSUE_INVOICE_FAILED";
    return { success: false, error: message };
  }
}
