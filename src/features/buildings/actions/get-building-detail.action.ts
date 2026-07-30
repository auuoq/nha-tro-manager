"use server";

import { getBuildingDetailQuery } from "../queries/get-building-detail.query";
import { BuildingDetailDTO } from "../types/building.types";

export async function getBuildingDetailAction(buildingId: string): Promise<{ success: boolean; data?: BuildingDetailDTO | null; error?: string }> {
  try {
    const detail = await getBuildingDetailQuery(buildingId);
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_BUILDING_DETAIL_FAILED";
    return { success: false, error: message };
  }
}
