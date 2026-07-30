"use server";

import { getTenantInvoicesQuery } from "../queries/get-tenant-invoices.query";
import { InvoiceItemDTOList } from "../types/invoice.types";

export async function getTenantInvoicesAction(): Promise<{ success: boolean; data?: InvoiceItemDTOList[]; error?: string }> {
  try {
    const invoices = await getTenantInvoicesQuery();
    return { success: true, data: invoices };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_TENANT_INVOICES_FAILED";
    return { success: false, error: message };
  }
}
