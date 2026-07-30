"use server";

import { activateContractService } from "../services/activate-contract.service";

export async function activateContractAction(contractId: string, actualMoveInDate?: Date) {
  try {
    const contract = await activateContractService(contractId, actualMoveInDate);
    return { success: true, data: contract };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ACTIVATE_CONTRACT_FAILED";
    return { success: false, error: message };
  }
}
