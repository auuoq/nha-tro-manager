"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const contract_schema_1 = require("../src/features/contracts/schemas/contract.schema");
const contract_charge_config_schema_1 = require("../src/features/contracts/schemas/contract-charge-config.schema");
const validate_contract_overlap_service_1 = require("../src/features/contracts/services/validate-contract-overlap.service");
async function runPhase34Tests() {
    console.log("🧪 Running Phase 3.4 Contracts Validation & Unit Test Suite...\n");
    let passedCount = 0;
    let totalTests = 9;
    // Test 1: startDate < endDate validation
    try {
        const res = contract_schema_1.createContractSchema.safeParse({
            roomId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            primaryTenantId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a3",
            startDate: new Date("2026-12-31"),
            endDate: new Date("2026-01-01"), // Invalid: startDate > endDate!
            depositAmount: 3500000,
            monthlyPrice: 3500000,
            billingDay: 5,
        });
        if (!res.success) {
            console.log("✅ [TEST 1 PASSED] startDate >= endDate rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 1 FAILED] Allowed startDate >= endDate!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 1 FAILED]", e);
    }
    // Test 2: billingDay range 1..28
    try {
        const res = contract_schema_1.createContractSchema.safeParse({
            roomId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            primaryTenantId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a3",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
            depositAmount: 3500000,
            monthlyPrice: 3500000,
            billingDay: 31, // Invalid: > 28!
        });
        if (!res.success) {
            console.log("✅ [TEST 2 PASSED] Invalid billingDay (> 28) rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 2 FAILED] Allowed billingDay = 31!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 2 FAILED]", e);
    }
    // Test 3: monthlyPrice > 0
    try {
        const res = contract_schema_1.createContractSchema.safeParse({
            roomId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            primaryTenantId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a3",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
            depositAmount: 3500000,
            monthlyPrice: 0, // Invalid!
            billingDay: 5,
        });
        if (!res.success) {
            console.log("✅ [TEST 3 PASSED] Non-positive monthlyPrice rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 3 FAILED] Allowed zero monthlyPrice!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 3 FAILED]", e);
    }
    // Test 4: Terminate contract deposit returned + deduction validation
    try {
        const res = contract_schema_1.terminateContractSchema.safeParse({
            contractId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
            terminationReason: "Khách chuyển đi",
            depositReturnedAmount: -500, // Invalid: negative!
            depositDeductionAmount: 0,
        });
        if (!res.success) {
            console.log("✅ [TEST 4 PASSED] Negative depositReturnedAmount rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 4 FAILED] Allowed negative depositReturnedAmount!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 4 FAILED]", e);
    }
    // Test 5: Contract ChargeConfig METERED method restriction for non-metered service
    try {
        const res = contract_charge_config_schema_1.contractChargeConfigSchema.safeParse({
            chargeType: "WIFI",
            chargeMethod: "METERED", // Invalid!
            unitPrice: 100000,
            effectiveFrom: new Date(),
        });
        if (!res.success) {
            console.log("✅ [TEST 5 PASSED] Contract METERED restriction for non-metered service OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 5 FAILED] Allowed METERED method for WIFI!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 5 FAILED]", e);
    }
    // Test 6: Contract ChargeConfig FREE method requires unitPrice === 0
    try {
        const res = contract_charge_config_schema_1.contractChargeConfigSchema.safeParse({
            chargeType: "PARKING",
            chargeMethod: "FREE",
            unitPrice: 50000, // Invalid!
            effectiveFrom: new Date(),
        });
        if (!res.success) {
            console.log("✅ [TEST 6 PASSED] Contract FREE method requires unitPrice = 0 OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 6 FAILED] Allowed non-zero unitPrice for FREE method!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 6 FAILED]", e);
    }
    // Test 7: Contract Date Overlap Detection
    try {
        const mockTx = {
            contract: {
                findMany: async () => [
                    {
                        id: "c-active-1",
                        contractCode: "CT-202601-ACTIVE",
                        startDate: new Date("2026-01-01"),
                        endDate: new Date("2026-12-31"),
                    },
                ],
            },
        };
        await (0, validate_contract_overlap_service_1.validateContractOverlapService)(mockTx, {
            roomId: "r-101",
            startDate: new Date("2026-06-01"), // Overlaps!
            endDate: new Date("2027-06-01"),
        });
        console.error("❌ [TEST 7 FAILED] Allowed overlapping Contract activation!");
    }
    catch (e) {
        if (e.message.includes("CONFLICT_CONTRACT_OVERLAP")) {
            console.log("✅ [TEST 7 PASSED] Active Contract Overlap Prevention OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 7 FAILED] Unexpected error:", e);
        }
    }
    // Test 8: Non-overlapping Contract Date Range Allowed
    try {
        const mockTx = {
            contract: {
                findMany: async () => [],
            },
        };
        await (0, validate_contract_overlap_service_1.validateContractOverlapService)(mockTx, {
            roomId: "r-101",
            startDate: new Date("2027-01-01"),
            endDate: new Date("2027-12-31"),
        });
        console.log("✅ [TEST 8 PASSED] Non-overlapping Contract activation allowed OK");
        passedCount++;
    }
    catch (e) {
        console.error("❌ [TEST 8 FAILED]", e);
    }
    // Test 9: Effective date order validation in Contract ChargeConfig (effectiveTo >= effectiveFrom)
    try {
        const res = contract_charge_config_schema_1.contractChargeConfigSchema.safeParse({
            chargeType: "ELECTRICITY",
            chargeMethod: "METERED",
            unitPrice: 4000,
            effectiveFrom: new Date("2026-12-31"),
            effectiveTo: new Date("2026-01-01"), // Invalid: effectiveTo < effectiveFrom!
        });
        if (!res.success) {
            console.log("✅ [TEST 9 PASSED] effectiveTo < effectiveFrom rejection OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 9 FAILED] Allowed effectiveTo < effectiveFrom!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 9 FAILED]", e);
    }
    console.log(`\n🎉 Test Suite Summary: ${passedCount}/${totalTests} Contracts Validation Tests Passed Successfully!`);
}
runPhase34Tests();
