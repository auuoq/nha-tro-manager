"use server";

import { createTenantAccountService } from "../services/manage-tenant-account.service";
import { CreateTenantAccountInput } from "../schemas/tenant-account.schema";

export async function createTenantAccountAction(input: CreateTenantAccountInput) {
  try {
    const result = await createTenantAccountService(input);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_TENANT_ACCOUNT_FAILED";
    return { success: false, error: message };
  }
}
