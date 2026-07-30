"use server";

import { recordMeterReadingService } from "../services/record-meter-reading.service";
import { RecordMeterReadingInput } from "../schemas/meter-reading.schema";

export async function recordMeterReadingAction(input: RecordMeterReadingInput) {
  try {
    const reading = await recordMeterReadingService(input);
    return { success: true, data: reading };
  } catch (error) {
    const message = error instanceof Error ? error.message : "RECORD_METER_READING_FAILED";
    return { success: false, error: message };
  }
}
