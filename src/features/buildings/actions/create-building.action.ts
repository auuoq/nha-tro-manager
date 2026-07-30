"use server";

import { createBuildingService } from "../services/create-building.service";
import { CreateBuildingInput } from "../schemas/building.schema";

export async function createBuildingAction(input: CreateBuildingInput) {
  try {
    const building = await createBuildingService(input);
    return { success: true, data: building };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_BUILDING_FAILED";
    return { success: false, error: message };
  }
}
