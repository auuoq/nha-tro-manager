"use server";

import { toggleTenantAccountStatusService } from "../services/manage-tenant-account.service";

export async function suspendTenantAccountAction(tenantId: string) {
  try {
    await toggleTenantAccountStatusService(tenantId, false);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SUSPEND_TENANT_ACCOUNT_FAILED";
    return { success: false, error: message };
  }
}
