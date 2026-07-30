"use server";

import { createDraftInvoiceService } from "../services/create-draft-invoice.service";
import { CreateDraftInvoiceInput } from "../schemas/invoice.schema";

export async function createDraftInvoiceAction(input: CreateDraftInvoiceInput) {
  try {
    const invoice = await createDraftInvoiceService(input);
    return { success: true, data: invoice };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_DRAFT_INVOICE_FAILED";
    return { success: false, error: message };
  }
}
