import "dotenv/config";
import { validateChargeConfigOverlap } from "../src/server/database/validate-charge-config-overlap.service";
import { createRoomSchema } from "../src/features/rooms/schemas/room.schema";
import { roomChargeConfigSchema } from "../src/features/rooms/schemas/room-charge-config.schema";
import { ChargeType, ChargeMethod } from "@prisma/client";

async function runPhase32Tests() {
  console.log("🧪 Running Phase 3.2 Validation & Integration Test Suite...\n");
  let unitPassed = 0;
  let unitTotal = 7;

  console.log("--- PART 1: VALIDATION & UNIT TESTS ---");

  // Test 1: roomNumber required & whitespace rejection
  try {
    const res = createRoomSchema.safeParse({
      buildingId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
      roomNumber: "   ", // Only spaces!
      floor: 1,
      roomType: "Khép kín",
      basePrice: 3000000,
      areaSqM: 25,
    });
    if (!res.success) {
      console.log("✅ [UNIT TEST 1 PASSED] Whitespace-only roomNumber rejection OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 1 FAILED] Allowed whitespace-only roomNumber!");
    }
  } catch (e) {
    console.error("❌ [UNIT TEST 1 FAILED]", e);
  }

  // Test 2: basePrice >= 0
  try {
    const res = createRoomSchema.safeParse({
      buildingId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
      roomNumber: "101",
      floor: 1,
      roomType: "Khép kín",
      basePrice: -500, // Invalid!
      areaSqM: 25,
    });
    if (!res.success) {
      console.log("✅ [UNIT TEST 2 PASSED] Negative basePrice rejection OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 2 FAILED] Allowed negative basePrice!");
    }
  } catch (e) {
    console.error("❌ [UNIT TEST 2 FAILED]", e);
  }

  // Test 3: areaSqM > 0
  try {
    const res = createRoomSchema.safeParse({
      buildingId: "3c9b7e41-0b5c-4d7a-85e2-2a6d482bc6a2",
      roomNumber: "101",
      floor: 1,
      roomType: "Khép kín",
      basePrice: 3000000,
      areaSqM: 0, // Invalid! Must be > 0
    });
    if (!res.success) {
      console.log("✅ [UNIT TEST 3 PASSED] Non-positive areaSqM rejection OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 3 FAILED] Allowed zero areaSqM!");
    }
  } catch (e) {
    console.error("❌ [UNIT TEST 3 FAILED]", e);
  }

  // Test 4: METERED ChargeMethod restricted to ELECTRICITY/WATER for Room
  try {
    const res = roomChargeConfigSchema.safeParse({
      chargeType: ChargeType.GARBAGE,
      chargeMethod: ChargeMethod.METERED, // Invalid!
      unitPrice: 30000,
      effectiveFrom: new Date(),
    });
    if (!res.success) {
      console.log("✅ [UNIT TEST 4 PASSED] METERED method restriction for non-metered Room service OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 4 FAILED] Allowed METERED method for GARBAGE!");
    }
  } catch (e) {
    console.error("❌ [UNIT TEST 4 FAILED]", e);
  }

  // Test 5: FREE ChargeMethod requires unitPrice === 0
  try {
    const res = roomChargeConfigSchema.safeParse({
      chargeType: ChargeType.WIFI,
      chargeMethod: ChargeMethod.FREE,
      unitPrice: 100000, // Invalid! Free must be 0
      effectiveFrom: new Date(),
    });
    if (!res.success) {
      console.log("✅ [UNIT TEST 5 PASSED] FREE method requires unitPrice = 0 OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 5 FAILED] Allowed non-zero unitPrice for FREE method!");
    }
  } catch (e) {
    console.error("❌ [UNIT TEST 5 FAILED]", e);
  }

  // Test 6: Room ChargeConfig Scope Guard (Exactly 1 scope: roomId present)
  try {
    const mockTx: any = {};
    await validateChargeConfigOverlap(mockTx, {
      buildingId: null,
      roomId: "r-101",
      contractId: "c-101", // Invalid: 2 scopes!
      chargeType: ChargeType.ELECTRICITY,
      effectiveFrom: new Date(),
    });
    console.error("❌ [UNIT TEST 6 FAILED] Allowed 2 scopes for Room ChargeConfig!");
  } catch (e: any) {
    if (e.message.includes("EXACTLY_ONE_REQUIRED")) {
      console.log("✅ [UNIT TEST 6 PASSED] Room ChargeConfig Exactly-One-Scope Guard OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 6 FAILED] Unexpected error:", e);
    }
  }

  // Test 7: Overlapping Room ChargeConfig Time Range Rejection
  try {
    const mockTx: any = {
      chargeConfig: {
        findMany: async () => [
          {
            id: "room-cfg-1",
            effectiveFrom: new Date("2026-01-01"),
            effectiveTo: new Date("2026-12-31"),
          },
        ],
      },
    };

    await validateChargeConfigOverlap(mockTx, {
      buildingId: null,
      roomId: "r-101",
      contractId: null,
      chargeType: ChargeType.ELECTRICITY,
      effectiveFrom: new Date("2026-06-01"), // Overlaps!
      effectiveTo: null,
    });
    console.error("❌ [UNIT TEST 7 FAILED] Allowed overlapping Room ChargeConfig range!");
  } catch (e: any) {
    if (e.message.includes("OVERLAP_CONFLICT")) {
      console.log("✅ [UNIT TEST 7 PASSED] Room ChargeConfig Overlap Prevention OK");
      unitPassed++;
    } else {
      console.error("❌ [UNIT TEST 7 FAILED] Unexpected error:", e);
    }
  }

  console.log(`\n🎉 Phase 3.2 Test Summary: ${unitPassed}/${unitTotal} Validation & Unit Tests Passed Successfully!`);
}

runPhase32Tests();
