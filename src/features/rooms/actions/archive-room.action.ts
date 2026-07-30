"use server";

import { archiveRoomService } from "../services/archive-room.service";

export async function archiveRoomAction(roomId: string, reason?: string) {
  try {
    await archiveRoomService(roomId, reason);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ARCHIVE_ROOM_FAILED";
    return { success: false, error: message };
  }
}
