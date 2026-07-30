"use server";

import { updateRoomAssetService } from "../services/manage-room-asset.service";
import { RoomAssetInput } from "../schemas/room-asset.schema";

export async function updateRoomAssetAction(assetId: string, input: RoomAssetInput) {
  try {
    const asset = await updateRoomAssetService(assetId, input);
    return { success: true, data: asset };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_ROOM_ASSET_FAILED";
    return { success: false, error: message };
  }
}
