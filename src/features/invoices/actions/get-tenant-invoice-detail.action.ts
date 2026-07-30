"use server";

import { getTenantInvoiceDetailQuery } from "../queries/get-tenant-invoice-detail.query";
import { InvoiceDetailDTO } from "../types/invoice.types";

export async function getTenantInvoiceDetailAction(invoiceId: string): Promise<{ success: boolean; data?: InvoiceDetailDTO | null; error?: string }> {
  try {
    const detail = await getTenantInvoiceDetailQuery(invoiceId);
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_TENANT_INVOICE_DETAIL_FAILED";
    return { success: false, error: message };
  }
}
