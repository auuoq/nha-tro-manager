"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePrivateMeterImageBuffer = savePrivateMeterImageBuffer;
exports.readPrivateMeterFileBuffer = readPrivateMeterFileBuffer;
exports.generateMeterSignedUrl = generateMeterSignedUrl;
exports.verifyMeterSignedUrlParams = verifyMeterSignedUrlParams;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const file_validation_1 = require("./file-validation");
const PRIVATE_METER_STORAGE_ROOT = path_1.default.join(process.cwd(), "storage", "private-meters");
function ensureDirectoryExists() {
    if (!fs_1.default.existsSync(PRIVATE_METER_STORAGE_ROOT)) {
        fs_1.default.mkdirSync(PRIVATE_METER_STORAGE_ROOT, { recursive: true });
    }
}
async function savePrivateMeterImageBuffer(buffer, originalFilename) {
    const validation = (0, file_validation_1.validateImageFileBuffer)(buffer, originalFilename);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }
    ensureDirectoryExists();
    const ext = validation.detectedMime === "image/png" ? "png" : validation.detectedMime === "image/webp" ? "webp" : "jpg";
    const uniqueFilename = `${crypto_1.default.randomUUID()}.${ext}`;
    const fullPath = path_1.default.join(PRIVATE_METER_STORAGE_ROOT, uniqueFilename);
    try {
        fs_1.default.writeFileSync(fullPath, buffer);
        const relativePath = `private-meters/${uniqueFilename}`;
        return { success: true, storagePath: relativePath };
    }
    catch (err) {
        console.error("Failed to write private meter file:", err);
        return { success: false, error: "Lỗi lưu file storage chỉ số đồng hồ" };
    }
}
function readPrivateMeterFileBuffer(storagePath) {
    const fullPath = path_1.default.join(process.cwd(), "storage", storagePath);
    if (!fs_1.default.existsSync(fullPath))
        return null;
    return fs_1.default.readFileSync(fullPath);
}
function generateMeterSignedUrl(readingId, expiresInSeconds = 300) {
    const ttl = Math.min(expiresInSeconds, 300);
    const expires = Math.floor(Date.now() / 1000) + ttl;
    const expiresAt = new Date(expires * 1000);
    const payload = `meter-reading:${readingId}:${expires}`;
    const hmac = crypto_1.default.createHmac("sha256", process.env.AUTH_SECRET || "antigravity-secret-key");
    hmac.update(payload);
    const signature = hmac.digest("hex");
    const url = `/api/storage/meter-reading?readingId=${readingId}&expires=${expires}&signature=${signature}`;
    return { url, expiresAt };
}
function verifyMeterSignedUrlParams(readingId, expiresStr, signature) {
    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires))
        return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds > expires)
        return false;
    const payload = `meter-reading:${readingId}:${expires}`;
    const hmac = crypto_1.default.createHmac("sha256", process.env.AUTH_SECRET || "antigravity-secret-key");
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
