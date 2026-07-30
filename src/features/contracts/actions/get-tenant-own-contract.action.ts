"use server";

import { getTenantOwnContractQuery } from "../queries/get-tenant-own-contract.query";
import { ContractDetailDTO } from "../types/contract.types";

export async function getTenantOwnContractAction(): Promise<{ success: boolean; data?: ContractDetailDTO | null; error?: string }> {
  try {
    const detail = await getTenantOwnContractQuery();
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_TENANT_CONTRACT_FAILED";
    return { success: false, error: message };
  }
}
