import crypto from "crypto";
import { env } from "../../config/env";

export function generateCCCDSignedUrl(
  tenantId: string,
  side: "FRONT" | "BACK",
  expiresInSeconds = 300 // TTL tối đa 5 phút
): { url: string; expiresAt: Date } {
  const ttl = Math.min(expiresInSeconds, 300);
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const expiresAt = new Date(expires * 1000);

  const payload = `${tenantId}:${side}:${expires}`;
  const hmac = crypto.createHmac("sha256", env.AUTH_SECRET);
  hmac.update(payload);
  const signature = hmac.digest("hex");

  const url = `/api/storage/cccd?tenantId=${tenantId}&side=${side}&expires=${expires}&signature=${signature}`;

  return { url, expiresAt };
}

export function verifyCCCDSignedUrlParams(
  tenantId: string,
  side: "FRONT" | "BACK",
  expiresStr: string,
  signature: string
): boolean {
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds > expires) {
    return false; // Hết hạn URL
  }

  const payload = `${tenantId}:${side}:${expires}`;
  const hmac = crypto.createHmac("sha256", env.AUTH_SECRET);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
