"use server";

import { addManualInvoiceItemService } from "../services/manage-manual-invoice-item.service";
import { AddManualInvoiceItemInput } from "../schemas/invoice-item.schema";

export async function addManualInvoiceItemAction(input: AddManualInvoiceItemInput) {
  try {
    const item = await addManualInvoiceItemService(input);
    return { success: true, data: item };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ADD_MANUAL_ITEM_FAILED";
    return { success: false, error: message };
  }
}
