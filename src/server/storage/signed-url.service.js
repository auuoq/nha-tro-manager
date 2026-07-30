"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCCCDSignedUrl = generateCCCDSignedUrl;
exports.verifyCCCDSignedUrlParams = verifyCCCDSignedUrlParams;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
function generateCCCDSignedUrl(tenantId, side, expiresInSeconds = 300 // TTL tối đa 5 phút
) {
    const ttl = Math.min(expiresInSeconds, 300);
    const expires = Math.floor(Date.now() / 1000) + ttl;
    const expiresAt = new Date(expires * 1000);
    const payload = `${tenantId}:${side}:${expires}`;
    const hmac = crypto_1.default.createHmac("sha256", env_1.env.AUTH_SECRET);
    hmac.update(payload);
    const signature = hmac.digest("hex");
    const url = `/api/storage/cccd?tenantId=${tenantId}&side=${side}&expires=${expires}&signature=${signature}`;
    return { url, expiresAt };
}
function verifyCCCDSignedUrlParams(tenantId, side, expiresStr, signature) {
    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires))
        return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds > expires) {
        return false; // Hết hạn URL
    }
    const payload = `${tenantId}:${side}:${expires}`;
    const hmac = crypto_1.default.createHmac("sha256", env_1.env.AUTH_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
