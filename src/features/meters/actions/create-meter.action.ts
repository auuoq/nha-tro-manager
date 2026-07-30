"use server";

import { createMeterService } from "../services/create-meter.service";
import { CreateMeterInput } from "../schemas/meter.schema";

export async function createMeterAction(input: CreateMeterInput) {
  try {
    const meter = await createMeterService(input);
    return { success: true, data: meter };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_METER_FAILED";
    return { success: false, error: message };
  }
}
