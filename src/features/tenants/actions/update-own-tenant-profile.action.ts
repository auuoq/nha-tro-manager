"use server";

import { updateOwnTenantProfileService } from "../services/update-own-tenant-profile.service";
import { TenantProfileSelfServiceInput } from "../schemas/tenant-profile-self-service.schema";

export async function updateOwnTenantProfileAction(input: TenantProfileSelfServiceInput) {
  try {
    const updated = await updateOwnTenantProfileService(input);
    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_PROFILE_FAILED";
    return { success: false, error: message };
  }
}
