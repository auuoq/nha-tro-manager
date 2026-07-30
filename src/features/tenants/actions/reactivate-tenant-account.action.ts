"use server";

import { toggleTenantAccountStatusService } from "../services/manage-tenant-account.service";

export async function reactivateTenantAccountAction(tenantId: string) {
  try {
    await toggleTenantAccountStatusService(tenantId, true);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "REACTIVATE_TENANT_ACCOUNT_FAILED";
    return { success: false, error: message };
  }
}
