"use server";

import { removeContractMemberService } from "../services/manage-contract-tenants.service";

export async function removeContractMemberAction(contractTenantId: string) {
  try {
    const ct = await removeContractMemberService(contractTenantId);
    return { success: true, data: ct };
  } catch (error) {
    const message = error instanceof Error ? error.message : "REMOVE_MEMBER_FAILED";
    return { success: false, error: message };
  }
}
