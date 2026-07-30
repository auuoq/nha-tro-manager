"use server";

import { upsertContractChargeConfigService } from "../services/upsert-contract-charge-config.service";
import { ContractChargeConfigInput } from "../schemas/contract-charge-config.schema";

export async function createContractChargeConfigAction(contractId: string, input: ContractChargeConfigInput) {
  try {
    const config = await upsertContractChargeConfigService(contractId, input);
    return { success: true, data: config };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_CONTRACT_CHARGE_CONFIG_FAILED";
    return { success: false, error: message };
  }
}
