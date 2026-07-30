"use server";

import { upsertRoomChargeConfigService } from "../services/upsert-room-charge-config.service";
import { RoomChargeConfigInput } from "../schemas/room-charge-config.schema";

export async function createRoomChargeConfigAction(roomId: string, input: RoomChargeConfigInput) {
  try {
    const config = await upsertRoomChargeConfigService(roomId, input);
    return { success: true, data: config };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_ROOM_CHARGE_CONFIG_FAILED";
    return { success: false, error: message };
  }
}
