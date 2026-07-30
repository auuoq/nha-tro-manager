"use server";

import { uploadTenantIdCardService } from "../services/manage-tenant-id-card.service";

export async function uploadTenantIdCardAction(
  tenantId: string,
  side: "FRONT" | "BACK",
  base64Data: string,
  originalFilename: string
) {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const storagePath = await uploadTenantIdCardService(tenantId, side, buffer, originalFilename);
    return { success: true, storagePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPLOAD_ID_CARD_FAILED";
    return { success: false, error: message };
  }
}
