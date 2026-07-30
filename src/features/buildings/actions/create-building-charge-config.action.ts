"use server";

import { upsertBuildingChargeConfigService } from "../services/upsert-building-charge-config.service";
import { BuildingChargeConfigInput } from "../schemas/building-charge-config.schema";

export async function createBuildingChargeConfigAction(
  buildingId: string,
  input: BuildingChargeConfigInput,
  excludeConfigId?: string
) {
  try {
    const config = await upsertBuildingChargeConfigService(buildingId, input, excludeConfigId);
    return { success: true, data: config };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPSERT_CHARGE_CONFIG_FAILED";
    return { success: false, error: message };
  }
}
