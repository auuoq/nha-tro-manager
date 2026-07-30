"use server";

import { resetTenantPasswordService } from "../services/manage-tenant-account.service";

export async function resetTenantPasswordAction(tenantId: string) {
  try {
    const tempPassword = await resetTenantPasswordService(tenantId);
    return { success: true, tempPassword };
  } catch (error) {
    const message = error instanceof Error ? error.message : "RESET_PASSWORD_FAILED";
    return { success: false, error: message };
  }
}
