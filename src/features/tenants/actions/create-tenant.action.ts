"use server";

import { createTenantService } from "../services/create-tenant.service";
import { CreateTenantInput } from "../schemas/tenant.schema";

export async function createTenantAction(input: CreateTenantInput) {
  try {
    const tenant = await createTenantService(input);
    return { success: true, data: tenant };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_TENANT_FAILED";
    return { success: false, error: message };
  }
}
