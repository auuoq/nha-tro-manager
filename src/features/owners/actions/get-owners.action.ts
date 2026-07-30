"use server";

import { getOwnersQuery } from "../queries/get-owners.query";
import { OwnerItemDTO } from "../types/owner.types";

export async function getOwnersAction(): Promise<{ success: boolean; data?: OwnerItemDTO[]; error?: string }> {
  try {
    const data = await getOwnersQuery();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_OWNERS_FAILED";
    return { success: false, error: message };
  }
}
