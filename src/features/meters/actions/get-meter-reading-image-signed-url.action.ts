"use server";

import { getMeterReadingImageSignedUrlService } from "../services/manage-meter-reading-image.service";

export async function getMeterReadingImageSignedUrlAction(readingId: string) {
  try {
    const result = await getMeterReadingImageSignedUrlService(readingId);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "GET_METER_SIGNED_URL_FAILED";
    return { success: false, error: message };
  }
}
