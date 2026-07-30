"use server";

import { cancelPaymentService } from "../services/cancel-payment.service";
import { CancelPaymentInput } from "../schemas/payment.schema";

export async function cancelPaymentAction(input: CancelPaymentInput) {
  try {
    const result = await cancelPaymentService(input);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CANCEL_PAYMENT_FAILED";
    return { success: false, error: message };
  }
}
