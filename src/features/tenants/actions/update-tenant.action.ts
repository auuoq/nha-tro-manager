"use server";

import { updateTenantService } from "../services/update-tenant.service";
import { UpdateTenantInput } from "../schemas/tenant.schema";

export async function updateTenantAction(input: UpdateTenantInput) {
  try {
    const tenant = await updateTenantService(input);
    return { success: true, data: tenant };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_TENANT_FAILED";
    return { success: false, error: message };
  }
}
