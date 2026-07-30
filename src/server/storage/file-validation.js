"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageFileBuffer = validateImageFileBuffer;
function validateImageFileBuffer(buffer, originalFilename) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (buffer.length > MAX_SIZE) {
        return { valid: false, error: "Dung lượng ảnh không được vượt quá 5MB" };
    }
    // Reject SVG by extension
    const ext = originalFilename.split(".").pop()?.toLowerCase();
    if (ext === "svg" || originalFilename.toLowerCase().endsWith(".svg")) {
        return { valid: false, error: "Định dạng SVG không được chấp nhận vì lý do an ninh" };
    }
    // Check magic bytes
    if (buffer.length < 4) {
        return { valid: false, error: "File không hợp lệ" };
    }
    const hex = buffer.toString("hex", 0, 4).toUpperCase();
    // JPEG: FF D8 FF
    if (hex.startsWith("FFD8FF")) {
        return { valid: true, detectedMime: "image/jpeg" };
    }
    // PNG: 89 50 4E 47
    if (hex === "89504E47") {
        return { valid: true, detectedMime: "image/png" };
    }
    // WebP: 52 49 46 46 (RIFF header)
    if (hex === "52494646") {
        return { valid: true, detectedMime: "image/webp" };
    }
    return { valid: false, error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP" };
}
