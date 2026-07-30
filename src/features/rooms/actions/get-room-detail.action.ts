"use server";

import { getRoomDetailQuery } from "../queries/get-room-detail.query";
import { RoomDetailDTO } from "../types/room.types";

export async function getRoomDetailAction(roomId: string): Promise<{ success: boolean; data?: RoomDetailDTO | null; error?: string }> {
  try {
    const detail = await getRoomDetailQuery(roomId);
    return { success: true, data: detail };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_ROOM_DETAIL_FAILED";
    return { success: false, error: message };
  }
}
