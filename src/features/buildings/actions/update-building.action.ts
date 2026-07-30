"use server";

import { updateBuildingService } from "../services/update-building.service";
import { UpdateBuildingInput } from "../schemas/building.schema";

export async function updateBuildingAction(input: UpdateBuildingInput) {
  try {
    const building = await updateBuildingService(input);
    return { success: true, data: building };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_BUILDING_FAILED";
    return { success: false, error: message };
  }
}
