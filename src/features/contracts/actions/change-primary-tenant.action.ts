"use server";

import { changePrimaryTenantService } from "../services/manage-contract-tenants.service";
import { ChangePrimaryTenantInput } from "../schemas/contract-tenant.schema";

export async function changePrimaryTenantAction(input: ChangePrimaryTenantInput) {
  try {
    await changePrimaryTenantService(input);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHANGE_PRIMARY_FAILED";
    return { success: false, error: message };
  }
}
