import fs from "fs";
import path from "path";
import { getPrivateStorageProvider } from "./storage-factory";

export async function savePrivateCCCDImageBuffer(
  buffer: Buffer,
  originalFilename: string,
  ownerId = "default-owner",
  tenantId = "default-tenant",
  side: "front" | "back" = "front"
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  const provider = getPrivateStorageProvider();
  return provider.upload({
    buffer,
    originalFilename,
    category: "cccd",
    ownerId,
    entityId: tenantId,
    subId: side,
  });
}

export function readPrivateCCCDFileBuffer(storagePath: string): Buffer | null {
  const fullPath = path.join(process.cwd(), "storage", storagePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath);
}

export async function deletePrivateCCCDFile(storagePath: string): Promise<void> {
  const provider = getPrivateStorageProvider();
  await provider.remove(storagePath);
}
