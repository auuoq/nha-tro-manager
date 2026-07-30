"use server";

import { terminateContractService } from "../services/terminate-contract.service";
import { TerminateContractInput } from "../schemas/contract.schema";

export async function terminateContractAction(input: TerminateContractInput) {
  try {
    const contract = await terminateContractService(input);
    return { success: true, data: contract };
  } catch (error) {
    const message = error instanceof Error ? error.message : "TERMINATE_CONTRACT_FAILED";
    return { success: false, error: message };
  }
}
