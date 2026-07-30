"use server";

import { getTenantDetailQuery } from "../queries/get-tenant-detail.query";
import { TenantDetailDTO } from "../types/tenant.types";

export async function getTenantDetailAction(tenantId: string): Promise<{ success: boolean; data?: TenantDetailDTO | null; error?: string }> {
  try {
    const detail = await getTenantDetailQuery(tenantId);
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_TENANT_DETAIL_FAILED";
    return { success: false, error: message };
  }
}
