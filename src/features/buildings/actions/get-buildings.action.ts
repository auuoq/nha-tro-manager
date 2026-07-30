"use server";

import { getBuildingsQuery } from "../queries/get-buildings.query";
import { BuildingItemDTO } from "../types/building.types";

export async function getBuildingsAction(): Promise<{ success: boolean; data?: BuildingItemDTO[]; error?: string }> {
  try {
    const buildings = await getBuildingsQuery();
    return { success: true, data: buildings };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_BUILDINGS_FAILED";
    return { success: false, error: message };
  }
}
