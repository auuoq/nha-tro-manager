"use server";

import { archiveBuildingService } from "../services/archive-building.service";

export async function archiveBuildingAction(buildingId: string, reason?: string) {
  try {
    await archiveBuildingService(buildingId, reason);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ARCHIVE_BUILDING_FAILED";
    return { success: false, error: message };
  }
}
