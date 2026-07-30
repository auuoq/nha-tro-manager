"use server";

import { upsertBuildingChargeConfigService } from "../services/upsert-building-charge-config.service";
import { BuildingChargeConfigInput } from "../schemas/building-charge-config.schema";

export async function updateBuildingChargeConfigAction(
  buildingId: string,
  configId: string,
  input: BuildingChargeConfigInput
) {
  try {
    const config = await upsertBuildingChargeConfigService(buildingId, input, configId);
    return { success: true, data: config };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_CHARGE_CONFIG_FAILED";
    return { success: false, error: message };
  }
}
