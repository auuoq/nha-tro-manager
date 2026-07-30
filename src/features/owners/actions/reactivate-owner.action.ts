"use server";

import { updateOwnerStatusService } from "../services/update-owner-status.service";
import { OwnerStatus } from "@prisma/client";

export async function reactivateOwnerAction(ownerUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateOwnerStatusService(ownerUserId, OwnerStatus.ACTIVE);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "REACTIVATE_OWNER_FAILED";
    return { success: false, error: message };
  }
}
