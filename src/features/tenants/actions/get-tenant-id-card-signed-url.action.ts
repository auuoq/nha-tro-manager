"use server";

import { getTenantIdCardSignedUrlService } from "../services/manage-tenant-id-card.service";

export async function getTenantIdCardSignedUrlAction(
  tenantId: string,
  side: "FRONT" | "BACK",
  supportReason?: string
) {
  try {
    const result = await getTenantIdCardSignedUrlService(tenantId, side, supportReason);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "GET_SIGNED_URL_FAILED";
    return { success: false, error: message };
  }
}
