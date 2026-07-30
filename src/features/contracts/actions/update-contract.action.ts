"use server";

import { updateContractService } from "../services/update-contract.service";
import { UpdateContractInput } from "../schemas/contract.schema";

export async function updateContractAction(input: UpdateContractInput) {
  try {
    const contract = await updateContractService(input);
    return { success: true, data: contract };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_CONTRACT_FAILED";
    return { success: false, error: message };
  }
}
