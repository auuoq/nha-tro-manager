"use server";

import { getMeterReadingsQuery } from "../queries/get-meter-readings.query";
import { MeterReadingDTO } from "../types/meter.types";

export async function getMeterReadingsAction(period?: string): Promise<{ success: boolean; data?: MeterReadingDTO[]; error?: string }> {
  try {
    const readings = await getMeterReadingsQuery(period);
    return { success: true, data: readings };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_READINGS_FAILED";
    return { success: false, error: message };
  }
}
