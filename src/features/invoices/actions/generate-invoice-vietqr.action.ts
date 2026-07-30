"use server";

import { generateInvoiceVietQRService } from "../services/generate-invoice-vietqr.service";

export async function generateInvoiceVietQRAction(invoiceId: string) {
  try {
    const result = await generateInvoiceVietQRService(invoiceId);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "GENERATE_VIETQR_FAILED";
    return { success: false, error: message };
  }
}
