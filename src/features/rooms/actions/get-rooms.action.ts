"use server";

import { getRoomsQuery } from "../queries/get-rooms.query";
import { RoomItemDTO } from "../types/room.types";

export async function getRoomsAction(buildingId?: string): Promise<{ success: boolean; data?: RoomItemDTO[]; error?: string }> {
  try {
    const rooms = await getRoomsQuery(buildingId);
    return { success: true, data: rooms };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_ROOMS_FAILED";
    return { success: false, error: message };
  }
}
