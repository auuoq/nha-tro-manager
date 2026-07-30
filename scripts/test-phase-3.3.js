"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const tenant_schema_1 = require("../src/features/tenants/schemas/tenant.schema");
const tenant_profile_self_service_schema_1 = require("../src/features/tenants/schemas/tenant-profile-self-service.schema");
const file_validation_1 = require("../src/server/storage/file-validation");
const signed_url_service_1 = require("../src/server/storage/signed-url.service");
async function runPhase33Tests() {
    console.log("🧪 Running Phase 3.3 Tenants & CCCD Storage Validation Test Suite...\n");
    let passedCount = 0;
    let totalTests = 9;
    // Test 1: FullName whitespace-only rejection
    try {
        const res = tenant_schema_1.createTenantSchema.safeParse({ fullName: "   " });
        if (!res.success) {
            console.log("✅ [TEST 1 PASSED] Whitespace-only fullName rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 1 FAILED] Allowed whitespace-only fullName!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 1 FAILED]", e);
    }
    // Test 2: Invalid phone format rejection
    try {
        const res = tenant_schema_1.createTenantSchema.safeParse({ fullName: "Nguyễn Văn A", phone: "123" });
        if (!res.success) {
            console.log("✅ [TEST 2 PASSED] Invalid phone number format rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 2 FAILED] Allowed 3-digit phone number!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 2 FAILED]", e);
    }
    // Test 3: SVG file rejection for CCCD storage
    try {
        const svgBuffer = Buffer.from("<svg>malicious</svg>");
        const val = (0, file_validation_1.validateImageFileBuffer)(svgBuffer, "cccd.svg");
        if (!val.valid && val.error?.includes("SVG")) {
            console.log("✅ [TEST 3 PASSED] SVG file upload rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 3 FAILED] Allowed SVG file upload!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 3 FAILED]", e);
    }
    // Test 4: File size limit (>5MB) rejection
    try {
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
        const val = (0, file_validation_1.validateImageFileBuffer)(largeBuffer, "cccd.jpg");
        if (!val.valid && val.error?.includes("5MB")) {
            console.log("✅ [TEST 4 PASSED] File size limit >5MB rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 4 FAILED] Allowed 6MB file upload!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 4 FAILED]", e);
    }
    // Test 5: Magic bytes validation (Fake JPG with invalid header)
    try {
        const fakeBuffer = Buffer.from("INVALID_HEADER_DATA_12345");
        const val = (0, file_validation_1.validateImageFileBuffer)(fakeBuffer, "fake.jpg");
        if (!val.valid) {
            console.log("✅ [TEST 5 PASSED] Magic bytes header validation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 5 FAILED] Allowed fake image header!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 5 FAILED]", e);
    }
    // Test 6: Valid JPEG Magic Bytes Header
    try {
        const validJpgBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
        const val = (0, file_validation_1.validateImageFileBuffer)(validJpgBuffer, "real.jpg");
        if (val.valid && val.detectedMime === "image/jpeg") {
            console.log("✅ [TEST 6 PASSED] Valid JPEG magic bytes detection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 6 FAILED] Failed to detect valid JPEG!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 6 FAILED]", e);
    }
    // Test 7: HMAC Signed URL generation & verification
    try {
        const tenantId = "t-101";
        const signed = (0, signed_url_service_1.generateCCCDSignedUrl)(tenantId, "FRONT", 300);
        const urlObj = new URL(`http://localhost${signed.url}`);
        const side = urlObj.searchParams.get("side");
        const expires = urlObj.searchParams.get("expires");
        const signature = urlObj.searchParams.get("signature");
        const isValid = (0, signed_url_service_1.verifyCCCDSignedUrlParams)(tenantId, side, expires, signature);
        if (isValid) {
            console.log("✅ [TEST 7 PASSED] HMAC Signed URL generation & verification OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 7 FAILED] Signed URL verification failed!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 7 FAILED]", e);
    }
    // Test 8: Expired Signed URL rejection
    try {
        const tenantId = "t-101";
        const pastExpires = Math.floor(Date.now() / 1000) - 10; // 10 seconds ago
        const isValid = (0, signed_url_service_1.verifyCCCDSignedUrlParams)(tenantId, "FRONT", String(pastExpires), "fakesig");
        if (!isValid) {
            console.log("✅ [TEST 8 PASSED] Expired Signed URL rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 8 FAILED] Allowed expired Signed URL!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 8 FAILED]", e);
    }
    // Test 9: Self-service schema forbids editing idCardNumber or ownerId
    try {
        const keys = Object.keys(tenant_profile_self_service_schema_1.tenantProfileSelfServiceSchema.shape);
        const containsForbidden = keys.includes("idCardNumber") || keys.includes("ownerId") || keys.includes("userId");
        if (!containsForbidden) {
            console.log("✅ [TEST 9 PASSED] Self-service schema forbids sensitive fields OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 9 FAILED] Self-service schema contains sensitive fields!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 9 FAILED]", e);
    }
    console.log(`\n🎉 Test Suite Summary: ${passedCount}/${totalTests} Tenants & CCCD Storage Validation Tests Passed Successfully!`);
}
runPhase33Tests();
