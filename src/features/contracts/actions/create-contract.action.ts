"use server";

import { createContractService } from "../services/create-contract.service";
import { CreateContractInput } from "../schemas/contract.schema";

export async function createContractAction(input: CreateContractInput) {
  try {
    const contract = await createContractService(input);
    return { success: true, data: contract };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_CONTRACT_FAILED";
    return { success: false, error: message };
  }
}
