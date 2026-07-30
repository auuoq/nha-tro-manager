"use server";

import { getMetersQuery } from "../queries/get-meters.query";
import { MeterDTO } from "../types/meter.types";

export async function getMetersAction(roomId?: string): Promise<{ success: boolean; data?: MeterDTO[]; error?: string }> {
  try {
    const meters = await getMetersQuery(roomId);
    return { success: true, data: meters };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_METERS_FAILED";
    return { success: false, error: message };
  }
}
