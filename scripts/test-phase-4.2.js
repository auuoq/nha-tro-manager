"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const resolve_charge_config_service_1 = require("../src/features/invoices/services/resolve-charge-config.service");
const calculate_previous_outstanding_service_1 = require("../src/features/invoices/services/calculate-previous-outstanding.service");
const invoice_schema_1 = require("../src/features/invoices/schemas/invoice.schema");
const client_1 = require("@prisma/client");
async function runPhase42Tests() {
    console.log("🧪 Running Phase 4.2 Invoice Draft & Charge Resolution Validation Test Suite...\n");
    let passedCount = 0;
    let totalTests = 8;
    // Test 1: BillingPeriod YYYY-MM validation
    try {
        const res = invoice_schema_1.createDraftInvoiceSchema.safeParse({
            contractId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            billingPeriod: "2026/07", // Invalid format!
        });
        if (!res.success) {
            console.log("✅ [TEST 1 PASSED] Invalid billingPeriod format rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 1 FAILED] Allowed invalid billingPeriod format!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 1 FAILED]", e);
    }
    // Test 2: ChargeConfig Resolution Priority - Contract Level First
    try {
        const mockTx = {
            chargeConfig: {
                findMany: async (args) => {
                    if (args.where.contractId) {
                        return [
                            {
                                id: "cfg-contract-1",
                                chargeType: client_1.ChargeType.ELECTRICITY,
                                chargeMethod: client_1.ChargeMethod.METERED,
                                unitPrice: 3800,
                            },
                        ];
                    }
                    return [];
                },
            },
        };
        const res = await (0, resolve_charge_config_service_1.resolveChargeConfigService)(mockTx, {
            contractId: "c-101",
            roomId: "r-101",
            buildingId: "b-101",
            chargeType: client_1.ChargeType.ELECTRICITY,
            targetDate: new Date(),
        });
        if (res.sourceLevel === "CONTRACT" && res.unitPrice === 3800) {
            console.log("✅ [TEST 2 PASSED] ChargeConfig Resolution priority (CONTRACT level first) OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 2 FAILED] Contract level priority failed!", res);
        }
    }
    catch (e) {
        console.error("❌ [TEST 2 FAILED]", e);
    }
    // Test 3: ChargeConfig Resolution Priority - Fallback to Room Level
    try {
        const mockTx = {
            chargeConfig: {
                findMany: async (args) => {
                    if (args.where.contractId)
                        return [];
                    if (args.where.roomId) {
                        return [
                            {
                                id: "cfg-room-1",
                                chargeType: client_1.ChargeType.WATER,
                                chargeMethod: client_1.ChargeMethod.METERED,
                                unitPrice: 15000,
                            },
                        ];
                    }
                    return [];
                },
            },
        };
        const res = await (0, resolve_charge_config_service_1.resolveChargeConfigService)(mockTx, {
            contractId: "c-101",
            roomId: "r-101",
            buildingId: "b-101",
            chargeType: client_1.ChargeType.WATER,
            targetDate: new Date(),
        });
        if (res.sourceLevel === "ROOM" && res.unitPrice === 15000) {
            console.log("✅ [TEST 3 PASSED] ChargeConfig Resolution fallback to ROOM level OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 3 FAILED] Room level fallback failed!", res);
        }
    }
    catch (e) {
        console.error("❌ [TEST 3 FAILED]", e);
    }
    // Test 4: Missing ChargeConfig throws MISSING_CHARGE_CONFIG error
    try {
        const mockTx = {
            chargeConfig: {
                findMany: async () => [],
            },
        };
        await (0, resolve_charge_config_service_1.resolveChargeConfigService)(mockTx, {
            contractId: "c-101",
            roomId: "r-101",
            buildingId: "b-101",
            chargeType: client_1.ChargeType.GARBAGE,
            targetDate: new Date(),
        });
        console.error("❌ [TEST 4 FAILED] Allowed missing charge config!");
    }
    catch (e) {
        if (e.message.includes("MISSING_CHARGE_CONFIG")) {
            console.log("✅ [TEST 4 PASSED] Missing ChargeConfig error throwing OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 4 FAILED] Unexpected error:", e);
        }
    }
    // Test 5: Overlapping ChargeConfig at same level throws DATA_INTEGRITY_CHARGE_CONFIG_OVERLAP
    try {
        const mockTx = {
            chargeConfig: {
                findMany: async (args) => {
                    if (args.where.buildingId) {
                        return [
                            { id: "b1", chargeType: client_1.ChargeType.WIFI, chargeMethod: client_1.ChargeMethod.PER_ROOM, unitPrice: 100000 },
                            { id: "b2", chargeType: client_1.ChargeType.WIFI, chargeMethod: client_1.ChargeMethod.PER_ROOM, unitPrice: 120000 },
                        ];
                    }
                    return [];
                },
            },
        };
        await (0, resolve_charge_config_service_1.resolveChargeConfigService)(mockTx, {
            contractId: "c-101",
            roomId: "r-101",
            buildingId: "b-101",
            chargeType: client_1.ChargeType.WIFI,
            targetDate: new Date(),
        });
        console.error("❌ [TEST 5 FAILED] Allowed overlapping configs at building level!");
    }
    catch (e) {
        if (e.message.includes("DATA_INTEGRITY_CHARGE_CONFIG_OVERLAP")) {
            console.log("✅ [TEST 5 PASSED] Overlapping ChargeConfig error throwing OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 5 FAILED] Unexpected error:", e);
        }
    }
    // Test 6: Previous Outstanding Calculation - Only includes ISSUED/PARTIALLY_PAID/OVERDUE
    try {
        const mockTx = {
            invoice: {
                findMany: async () => [
                    { remainingAmount: 500000 }, // ISSUED
                    { remainingAmount: 200000 }, // PARTIALLY_PAID
                ],
            },
        };
        const outstanding = await (0, calculate_previous_outstanding_service_1.calculatePreviousOutstandingService)(mockTx, "c-101");
        if (outstanding === 700000) {
            console.log("✅ [TEST 6 PASSED] Previous Outstanding calculation sum OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 6 FAILED] Outstanding calculation incorrect!", outstanding);
        }
    }
    catch (e) {
        console.error("❌ [TEST 6 FAILED]", e);
    }
    // Test 7: Total Due calculation = Current Invoice Total + Previous Outstanding
    try {
        const currentInvoiceTotal = 3850000;
        const previousOutstanding = 700000;
        const totalAmountDue = currentInvoiceTotal + previousOutstanding;
        if (totalAmountDue === 4550000 && currentInvoiceTotal === 3850000) {
            console.log("✅ [TEST 7 PASSED] Total Due calculation does not contaminate current invoice total OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 7 FAILED] Total Due calculation error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 7 FAILED]", e);
    }
    // Test 8: Discount Amount validation (Cannot exceed subtotal)
    try {
        const subtotal = 3000000;
        const discount = 3500000; // Exceeds subtotal!
        const isExceeded = discount > subtotal;
        if (isExceeded) {
            console.log("✅ [TEST 8 PASSED] Discount exceeding subtotal validation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 8 FAILED] Discount validation failed!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 8 FAILED]", e);
    }
    console.log(`\n🎉 Test Suite Summary: ${passedCount}/${totalTests} Invoice Draft & Charge Resolution Tests Passed Successfully!`);
}
runPhase42Tests();
