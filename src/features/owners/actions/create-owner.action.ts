"use server";

import { createOwnerService } from "../services/create-owner.service";
import { CreateOwnerInput } from "../schemas/owner.schema";
import { CreateOwnerResult } from "../types/owner.types";

export async function createOwnerAction(input: CreateOwnerInput): Promise<{ success: boolean; data?: CreateOwnerResult; error?: string }> {
  try {
    const result = await createOwnerService(input);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_OWNER_FAILED";
    return { success: false, error: message };
  }
}
