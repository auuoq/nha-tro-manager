"use server";

import { addContractMemberService } from "../services/manage-contract-tenants.service";
import { AddContractMemberInput } from "../schemas/contract-tenant.schema";

export async function addContractMemberAction(input: AddContractMemberInput) {
  try {
    const ct = await addContractMemberService(input);
    return { success: true, data: ct };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ADD_MEMBER_FAILED";
    return { success: false, error: message };
  }
}
