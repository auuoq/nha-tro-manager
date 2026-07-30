import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getPrivateStorageProvider } from "./storage-factory";

export async function savePrivateMeterImageBuffer(
  buffer: Buffer,
  originalFilename: string,
  ownerId = "default-owner",
  meterId = "default-meter",
  readingId = "default-reading"
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  const provider = getPrivateStorageProvider();
  return provider.upload({
    buffer,
    originalFilename,
    category: "meter",
    ownerId,
    entityId: meterId,
    subId: readingId,
  });
}

export function readPrivateMeterFileBuffer(storagePath: string): Buffer | null {
  const fullPath = path.join(process.cwd(), "storage", storagePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath);
}

export function generateMeterSignedUrl(
  readingId: string,
  expiresInSeconds = 300
): { url: string; expiresAt: Date } {
  const ttl = Math.min(expiresInSeconds, 300);
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const expiresAt = new Date(expires * 1000);

  const payload = `meter-reading:${readingId}:${expires}`;
  const hmac = crypto.createHmac("sha256", process.env.AUTH_SECRET || "antigravity-secret-key");
  hmac.update(payload);
  const signature = hmac.digest("hex");

  const url = `/api/storage/meter-reading?readingId=${readingId}&expires=${expires}&signature=${signature}`;

  return { url, expiresAt };
}

export function verifyMeterSignedUrlParams(
  readingId: string,
  expiresStr: string,
  signature: string
): boolean {
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds > expires) return false;

  const payload = `meter-reading:${readingId}:${expires}`;
  const hmac = crypto.createHmac("sha256", process.env.AUTH_SECRET || "antigravity-secret-key");
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
