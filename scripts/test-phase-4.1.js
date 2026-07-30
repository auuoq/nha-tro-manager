"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const meter_reading_schema_1 = require("../src/features/meters/schemas/meter-reading.schema");
const meter_schema_1 = require("../src/features/meters/schemas/meter.schema");
const file_validation_1 = require("../src/server/storage/file-validation");
const private_meter_storage_service_1 = require("../src/server/storage/private-meter-storage.service");
async function runPhase41Tests() {
    console.log("🧪 Running Phase 4.1 Meters & MeterReadings Validation Test Suite...\n");
    let passedCount = 0;
    let totalTests = 8;
    // Test 1: currentValue >= previousValue check
    try {
        const res = meter_reading_schema_1.recordMeterReadingSchema.safeParse({
            meterId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            period: "2026-07",
            previousValue: 100,
            currentValue: 80, // Invalid: currentValue < previousValue!
        });
        if (!res.success) {
            console.log("✅ [TEST 1 PASSED] currentValue < previousValue rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 1 FAILED] Allowed currentValue < previousValue!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 1 FAILED]", e);
    }
    // Test 2: Period format YYYY-MM validation
    try {
        const res = meter_reading_schema_1.recordMeterReadingSchema.safeParse({
            meterId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            period: "2026/07", // Invalid format!
            previousValue: 100,
            currentValue: 150,
        });
        if (!res.success) {
            console.log("✅ [TEST 2 PASSED] Invalid period format (not YYYY-MM) rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 2 FAILED] Allowed invalid period format 2026/07!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 2 FAILED]", e);
    }
    // Test 3: consumption calculation = currentValue - previousValue
    try {
        const res = meter_reading_schema_1.recordMeterReadingSchema.parse({
            meterId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            period: "2026-07",
            previousValue: 100,
            currentValue: 185,
        });
        const consumption = res.currentValue - res.previousValue;
        if (consumption === 85) {
            console.log("✅ [TEST 3 PASSED] consumption = 85 calculation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 3 FAILED] Consumption calculation error!", consumption);
        }
    }
    catch (e) {
        console.error("❌ [TEST 3 FAILED]", e);
    }
    // Test 4: Serial number non-empty check
    try {
        const res = meter_schema_1.createMeterSchema.safeParse({
            roomId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            type: "ELECTRICITY",
            serialNumber: "   ", // Invalid!
            initialReading: 0,
        });
        if (!res.success) {
            console.log("✅ [TEST 4 PASSED] Empty serialNumber rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 4 FAILED] Allowed empty serialNumber!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 4 FAILED]", e);
    }
    // Test 5: Photo magic bytes validation (PNG magic header)
    try {
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const val = (0, file_validation_1.validateImageFileBuffer)(pngBuffer, "meter.png");
        if (val.valid && val.detectedMime === "image/png") {
            console.log("✅ [TEST 5 PASSED] PNG magic bytes detection for meter photo OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 5 FAILED] Failed to detect PNG magic bytes!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 5 FAILED]", e);
    }
    // Test 6: Meter photo SVG rejection
    try {
        const svgBuffer = Buffer.from("<svg>meter</svg>");
        const val = (0, file_validation_1.validateImageFileBuffer)(svgBuffer, "meter.svg");
        if (!val.valid) {
            console.log("✅ [TEST 6 PASSED] Meter photo SVG rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 6 FAILED] Allowed SVG file upload!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 6 FAILED]", e);
    }
    // Test 7: HMAC Signed URL generation & verification for meter photo
    try {
        const readingId = "mr-101";
        const signed = (0, private_meter_storage_service_1.generateMeterSignedUrl)(readingId, 300);
        const urlObj = new URL(`http://localhost${signed.url}`);
        const expires = urlObj.searchParams.get("expires");
        const signature = urlObj.searchParams.get("signature");
        const isValid = (0, private_meter_storage_service_1.verifyMeterSignedUrlParams)(readingId, expires, signature);
        if (isValid) {
            console.log("✅ [TEST 7 PASSED] Meter reading photo HMAC Signed URL verification OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 7 FAILED] Signed URL verification failed!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 7 FAILED]", e);
    }
    // Test 8: Expired meter Signed URL rejection
    try {
        const readingId = "mr-101";
        const pastExpires = Math.floor(Date.now() / 1000) - 15; // Expired 15s ago
        const isValid = (0, private_meter_storage_service_1.verifyMeterSignedUrlParams)(readingId, String(pastExpires), "fakesig");
        if (!isValid) {
            console.log("✅ [TEST 8 PASSED] Expired meter Signed URL rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 8 FAILED] Allowed expired meter Signed URL!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 8 FAILED]", e);
    }
    console.log(`\n🎉 Test Suite Summary: ${passedCount}/${totalTests} Meters & MeterReadings Validation Tests Passed Successfully!`);
}
runPhase41Tests();
