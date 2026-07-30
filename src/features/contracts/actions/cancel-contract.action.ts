"use server";

import { cancelContractService } from "../services/cancel-contract.service";
import { CancelContractInput } from "../schemas/contract.schema";

export async function cancelContractAction(input: CancelContractInput) {
  try {
    const contract = await cancelContractService(input);
    return { success: true, data: contract };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CANCEL_CONTRACT_FAILED";
    return { success: false, error: message };
  }
}
