"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveChargeConfigService = resolveChargeConfigService;
async function resolveChargeConfigService(tx, params) {
    const { contractId, roomId, buildingId, chargeType, targetDate } = params;
    // 1. Check Contract Level Override
    const contractConfigs = await tx.chargeConfig.findMany({
        where: {
            contractId,
            chargeType,
            effectiveFrom: { lte: targetDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: targetDate } }],
        },
    });
    if (contractConfigs.length > 1) {
        throw new Error(`DATA_INTEGRITY_CHARGE_CONFIG_OVERLAP: Phát hiện trùng lặp đơn giá ${chargeType} cấp Hợp đồng.`);
    }
    if (contractConfigs.length === 1) {
        const c = contractConfigs[0];
        return {
            sourceLevel: "CONTRACT",
            chargeType: c.chargeType,
            chargeMethod: c.chargeMethod,
            unitPrice: Number(c.unitPrice),
            configId: c.id,
        };
    }
    // 2. Check Room Level Override
    const roomConfigs = await tx.chargeConfig.findMany({
        where: {
            roomId,
            contractId: null,
            chargeType,
            effectiveFrom: { lte: targetDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: targetDate } }],
        },
    });
    if (roomConfigs.length > 1) {
        throw new Error(`DATA_INTEGRITY_CHARGE_CONFIG_OVERLAP: Phát hiện trùng lặp đơn giá ${chargeType} cấp Phòng trọ.`);
    }
    if (roomConfigs.length === 1) {
        const c = roomConfigs[0];
        return {
            sourceLevel: "ROOM",
            chargeType: c.chargeType,
            chargeMethod: c.chargeMethod,
            unitPrice: Number(c.unitPrice),
            configId: c.id,
        };
    }
    // 3. Check Building Level Default
    const buildingConfigs = await tx.chargeConfig.findMany({
        where: {
            buildingId,
            roomId: null,
            contractId: null,
            chargeType,
            effectiveFrom: { lte: targetDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: targetDate } }],
        },
    });
    if (buildingConfigs.length > 1) {
        throw new Error(`DATA_INTEGRITY_CHARGE_CONFIG_OVERLAP: Phát hiện trùng lặp đơn giá ${chargeType} cấp Tòa nhà.`);
    }
    if (buildingConfigs.length === 1) {
        const c = buildingConfigs[0];
        return {
            sourceLevel: "BUILDING",
            chargeType: c.chargeType,
            chargeMethod: c.chargeMethod,
            unitPrice: Number(c.unitPrice),
            configId: c.id,
        };
    }
    throw new Error(`MISSING_CHARGE_CONFIG: Chưa cấu hình đơn giá dịch vụ ${chargeType} cho Tòa nhà / Phòng / Hợp đồng.`);
}
