"use server";

import { getPaymentsQuery } from "../queries/get-payments.query";
import { PaymentItemDTO } from "../types/payment.types";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export async function getPaymentsAction(filter?: { invoiceId?: string; buildingId?: string; status?: PaymentStatus; method?: PaymentMethod }): Promise<{ success: boolean; data?: PaymentItemDTO[]; error?: string }> {
  try {
    const payments = await getPaymentsQuery(filter);
    return { success: true, data: payments };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_PAYMENTS_FAILED";
    return { success: false, error: message };
  }
}
