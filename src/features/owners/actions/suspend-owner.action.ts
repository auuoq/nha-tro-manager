"use server";

import { updateOwnerStatusService } from "../services/update-owner-status.service";
import { OwnerStatus } from "@prisma/client";

export async function suspendOwnerAction(ownerUserId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateOwnerStatusService(ownerUserId, OwnerStatus.SUSPENDED, reason);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SUSPEND_OWNER_FAILED";
    return { success: false, error: message };
  }
}
