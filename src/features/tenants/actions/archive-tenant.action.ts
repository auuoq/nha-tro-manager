"use server";

import { archiveTenantService } from "../services/archive-tenant.service";

export async function archiveTenantAction(tenantId: string, reason?: string) {
  try {
    await archiveTenantService(tenantId, reason);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ARCHIVE_TENANT_FAILED";
    return { success: false, error: message };
  }
}
