"use server";

import { getTenantPaymentsQuery } from "../queries/get-tenant-payments.query";
import { PaymentItemDTO } from "../types/payment.types";

export async function getTenantPaymentsAction(invoiceId?: string): Promise<{ success: boolean; data?: PaymentItemDTO[]; error?: string }> {
  try {
    const payments = await getTenantPaymentsQuery(invoiceId);
    return { success: true, data: payments };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_TENANT_PAYMENTS_FAILED";
    return { success: false, error: message };
  }
}
