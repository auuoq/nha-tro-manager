"use server";

import { recordManualPaymentService } from "../services/record-manual-payment.service";
import { RecordManualPaymentInput } from "../schemas/payment.schema";

export async function recordManualPaymentAction(input: RecordManualPaymentInput) {
  try {
    const result = await recordManualPaymentService(input);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "RECORD_MANUAL_PAYMENT_FAILED";
    return { success: false, error: message };
  }
}
