"use server";

import { getInvoicesQuery } from "../queries/get-invoices.query";
import { InvoiceItemDTOList } from "../types/invoice.types";

export async function getInvoicesAction(period?: string): Promise<{ success: boolean; data?: InvoiceItemDTOList[]; error?: string }> {
  try {
    const invoices = await getInvoicesQuery(period);
    return { success: true, data: invoices };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_INVOICES_FAILED";
    return { success: false, error: message };
  }
}
