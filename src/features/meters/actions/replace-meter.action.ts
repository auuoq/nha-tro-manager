"use server";

import { replaceMeterService } from "../services/replace-meter.service";
import { ReplaceMeterInput } from "../schemas/meter.schema";

export async function replaceMeterAction(input: ReplaceMeterInput) {
  try {
    const meter = await replaceMeterService(input);
    return { success: true, data: meter };
  } catch (error) {
    const message = error instanceof Error ? error.message : "REPLACE_METER_FAILED";
    return { success: false, error: message };
  }
}
