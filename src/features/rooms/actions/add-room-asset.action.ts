"use server";

import { addRoomAssetService } from "../services/manage-room-asset.service";
import { RoomAssetInput } from "../schemas/room-asset.schema";

export async function addRoomAssetAction(roomId: string, input: RoomAssetInput) {
  try {
    const asset = await addRoomAssetService(roomId, input);
    return { success: true, data: asset };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ADD_ROOM_ASSET_FAILED";
    return { success: false, error: message };
  }
}
