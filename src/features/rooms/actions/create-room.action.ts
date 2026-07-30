"use server";

import { createRoomService } from "../services/create-room.service";
import { CreateRoomInput } from "../schemas/room.schema";

export async function createRoomAction(input: CreateRoomInput) {
  try {
    const room = await createRoomService(input);
    return { success: true, data: room };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_ROOM_FAILED";
    return { success: false, error: message };
  }
}
