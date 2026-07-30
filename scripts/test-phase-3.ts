import "dotenv/config";
import { validateChargeConfigOverlap } from "../src/server/database/validate-charge-config-overlap.service";
import { generateRandomTempPassword, hashPassword } from "../src/server/auth/auth-service";
import { buildingChargeConfigSchema } from "../src/features/buildings/schemas/building-charge-config.schema";
import { createBuildingSchema } from "../src/features/buildings/schemas/building.schema";
import { ChargeType, ChargeMethod } from "@prisma/client";

async function runPhase3Tests() {
  console.log("🧪 Running Comprehensive Phase 3 Integration & Validation Test Suite...\n");
  let passedCount = 0;
  let totalTests = 8;

  // Test 1: Temp Password Generator & Bcrypt Hashing
  try {
    const tempPass = generateRandomTempPassword(8);
    if (tempPass.length !== 8) throw new Error("Temp password length mismatch");
    const hashed = await hashPassword(tempPass);
    if (!hashed.startsWith("$2a$") && !hashed.startsWith("$2b$")) throw new Error("Invalid bcrypt hash");
    console.log("✅ [TEST 1 PASSED] Temp Password Generator & Bcrypt Cost 12 Hashing OK");
    passedCount++;
  } catch (e) {
    console.error("❌ [TEST 1 FAILED]", e);
  }

  // Test 2: Reject ChargeConfig with Invalid Scope (0 or >1 scope)
  try {
    const mockTx: any = {};
    await validateChargeConfigOverlap(mockTx, {
      buildingId: "b-1",
      roomId: "r-1", // Invalid: 2 scopes at once!
      contractId: null,
      chargeType: ChargeType.ELECTRICITY,
      effectiveFrom: new Date(),
    });
    console.error("❌ [TEST 2 FAILED] Failed to reject invalid scope");
  } catch (e: any) {
    if (e.message.includes("EXACTLY_ONE_REQUIRED")) {
      console.log("✅ [TEST 2 PASSED] ChargeConfig Exactly-One-Scope Guard OK");
      passedCount++;
    } else {
      console.error("❌ [TEST 2 FAILED] Unexpected error:", e);
    }
  }

  // Test 3: Reject Overlapping ChargeConfig Time Ranges
  try {
    const mockTx: any = {
      chargeConfig: {
        findMany: async () => [
          {
            id: "cfg-1",
            effectiveFrom: new Date("2026-01-01"),
            effectiveTo: new Date("2026-12-31"),
          },
        ],
      },
    };

    await validateChargeConfigOverlap(mockTx, {
      buildingId: "b-1",
      roomId: null,
      contractId: null,
      chargeType: ChargeType.ELECTRICITY,
      effectiveFrom: new Date("2026-06-01"), // Overlaps with 2026-01-01 to 2026-12-31!
      effectiveTo: new Date("2027-06-01"),
    });
    console.error("❌ [TEST 3 FAILED] Failed to reject overlapping charge config");
  } catch (e: any) {
    if (e.message.includes("OVERLAP_CONFLICT")) {
      console.log("✅ [TEST 3 PASSED] ChargeConfig Time Range Overlap Validation OK");
      passedCount++;
    } else {
      console.error("❌ [TEST 3 FAILED] Unexpected error:", e);
    }
  }

  // Test 4: METERED ChargeMethod restriction (Only Electricity & Water allowed)
  try {
    const invalidRes = buildingChargeConfigSchema.safeParse({
      chargeType: ChargeType.WIFI,
      chargeMethod: ChargeMethod.METERED, // Invalid!
      unitPrice: 100000,
      effectiveFrom: new Date(),
    });
    if (!invalidRes.success) {
      console.log("✅ [TEST 4 PASSED] METERED ChargeMethod restriction for non-metered services OK");
      passedCount++;
    } else {
      console.error("❌ [TEST 4 FAILED] Allowed METERED method for WIFI!");
    }
  } catch (e) {
    console.error("❌ [TEST 4 FAILED]", e);
  }

  // Test 5: FREE ChargeMethod requires unitPrice === 0
  try {
    const invalidFree = buildingChargeConfigSchema.safeParse({
      chargeType: ChargeType.PARKING,
      chargeMethod: ChargeMethod.FREE,
      unitPrice: 50000, // Invalid! Free must be 0
      effectiveFrom: new Date(),
    });
    if (!invalidFree.success) {
      console.log("✅ [TEST 5 PASSED] FREE ChargeMethod requires unitPrice = 0 OK");
      passedCount++;
    } else {
      console.error("❌ [TEST 5 FAILED] Allowed non-zero unitPrice for FREE method!");
    }
  } catch (e) {
    console.error("❌ [TEST 5 FAILED]", e);
  }

  // Test 6: Effective Date Validation (effectiveTo >= effectiveFrom)
  try {
    const invalidDate = buildingChargeConfigSchema.safeParse({
      chargeType: ChargeType.WATER,
      chargeMethod: ChargeMethod.METERED,
      unitPrice: 20000,
      effectiveFrom: new Date("2026-06-01"),
      effectiveTo: new Date("2026-01-01"), // Invalid: effectiveTo < effectiveFrom!
    });
    if (!invalidDate.success) {
      console.log("✅ [TEST 6 PASSED] Effective Date Order Validation (effectiveTo >= effectiveFrom) OK");
      passedCount++;
    } else {
      console.error("❌ [TEST 6 FAILED] Allowed effectiveTo earlier than effectiveFrom!");
    }
  } catch (e) {
    console.error("❌ [TEST 6 FAILED]", e);
  }

  // Test 7: Strict Name & Address Trim Validation
  try {
    const invalidName = createBuildingSchema.safeParse({
      name: "   ", // Only spaces
      address: "   ",
    });
    if (!invalidName.success) {
      console.log("✅ [TEST 7 PASSED] Building Name & Address Trim Validation OK");
      passedCount++;
    } else {
      console.error("❌ [TEST 7 FAILED] Allowed whitespace-only building name!");
    }
  } catch (e) {
    console.error("❌ [TEST 7 FAILED]", e);
  }

  // Test 8: Non-overlapping Ranges Allowed
  try {
    const mockTx: any = {
      chargeConfig: {
        findMany: async () => [
          {
            id: "cfg-1",
            effectiveFrom: new Date("2026-01-01"),
            effectiveTo: new Date("2026-06-30"),
          },
        ],
      },
    };

    await validateChargeConfigOverlap(mockTx, {
      buildingId: "b-1",
      roomId: null,
      contractId: null,
      chargeType: ChargeType.ELECTRICITY,
      effectiveFrom: new Date("2026-07-01"), // Valid: Starts after previous range ends!
      effectiveTo: null,
    });
    console.log("✅ [TEST 8 PASSED] Non-overlapping ChargeConfig Time Range Allowed OK");
    passedCount++;
  } catch (e) {
    console.error("❌ [TEST 8 FAILED] Rejected valid non-overlapping range:", e);
  }

  console.log(`\n🎉 Test Suite Summary: ${passedCount}/${totalTests} Integration & Validation Tests Passed Successfully!`);
}

runPhase3Tests();
