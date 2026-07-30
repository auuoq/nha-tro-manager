"use server";

import { getTenantsQuery } from "../queries/get-tenants.query";
import { TenantItemDTO } from "../types/tenant.types";

export async function getTenantsAction(): Promise<{ success: boolean; data?: TenantItemDTO[]; error?: string }> {
  try {
    const tenants = await getTenantsQuery();
    return { success: true, data: tenants };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_TENANTS_FAILED";
    return { success: false, error: message };
  }
}
