"use server";

import { updateRoomService } from "../services/update-room.service";
import { UpdateRoomInput } from "../schemas/room.schema";

export async function updateRoomAction(input: UpdateRoomInput) {
  try {
    const room = await updateRoomService(input);
    return { success: true, data: room };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_ROOM_FAILED";
    return { success: false, error: message };
  }
}
