"use server";

import { getContractsQuery } from "../queries/get-contracts.query";
import { ContractItemDTO } from "../types/contract.types";

export async function getContractsAction(): Promise<{ success: boolean; data?: ContractItemDTO[]; error?: string }> {
  try {
    const contracts = await getContractsQuery();
    return { success: true, data: contracts };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_CONTRACTS_FAILED";
    return { success: false, error: message };
  }
}
