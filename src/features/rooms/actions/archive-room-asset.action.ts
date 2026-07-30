"use server";

import { archiveRoomAssetService } from "../services/manage-room-asset.service";

export async function archiveRoomAssetAction(assetId: string) {
  try {
    await archiveRoomAssetService(assetId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ARCHIVE_ROOM_ASSET_FAILED";
    return { success: false, error: message };
  }
}
