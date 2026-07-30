"use server";

import { getInvoiceDetailQuery } from "../queries/get-invoice-detail.query";
import { InvoiceDetailDTO } from "../types/invoice.types";

export async function getInvoiceDetailAction(invoiceId: string): Promise<{ success: boolean; data?: InvoiceDetailDTO | null; error?: string }> {
  try {
    const detail = await getInvoiceDetailQuery(invoiceId);
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_INVOICE_DETAIL_FAILED";
    return { success: false, error: message };
  }
}
