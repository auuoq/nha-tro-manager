"use server";

import { refundPaymentService } from "../services/refund-payment.service";
import { RefundPaymentInput } from "../schemas/payment.schema";

export async function refundPaymentAction(input: RefundPaymentInput) {
  try {
    const result = await refundPaymentService(input);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "REFUND_PAYMENT_FAILED";
    return { success: false, error: message };
  }
}
