"use server";

import { getContractDetailQuery } from "../queries/get-contract-detail.query";
import { ContractDetailDTO } from "../types/contract.types";

export async function getContractDetailAction(contractId: string): Promise<{ success: boolean; data?: ContractDetailDTO | null; error?: string }> {
  try {
    const detail = await getContractDetailQuery(contractId);
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_CONTRACT_DETAIL_FAILED";
    return { success: false, error: message };
  }
}
