"use server";

import { getOwnTenantProfileQuery } from "../queries/get-own-tenant-profile.query";
import { TenantDetailDTO } from "../types/tenant.types";

export async function getOwnTenantProfileAction(): Promise<{ success: boolean; data?: TenantDetailDTO | null; error?: string }> {
  try {
    const detail = await getOwnTenantProfileQuery();
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_OWN_PROFILE_FAILED";
    return { success: false, error: message };
  }
}
