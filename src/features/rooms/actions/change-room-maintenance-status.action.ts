"use server";

import { roomStatusTransitionService } from "../services/room-status-transition.service";
import { RoomStatus } from "@prisma/client";

export async function changeRoomMaintenanceStatusAction(roomId: string, targetStatus: RoomStatus, reason?: string) {
  try {
    const room = await roomStatusTransitionService(roomId, targetStatus, reason);
    return { success: true, data: room };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHANGE_ROOM_STATUS_FAILED";
    return { success: false, error: message };
  }
}
