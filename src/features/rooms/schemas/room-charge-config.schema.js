"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomChargeConfigSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.roomChargeConfigSchema = zod_1.z
    .object({
    chargeType: zod_1.z.nativeEnum(client_1.ChargeType),
    chargeMethod: zod_1.z.nativeEnum(client_1.ChargeMethod),
    unitPrice: zod_1.z.number().min(0, "Đơn giá không được âm"),
    effectiveFrom: zod_1.z.date().default(() => new Date()),
    effectiveTo: zod_1.z.date().nullable().optional(),
})
    .refine((data) => {
    if (data.chargeMethod === client_1.ChargeMethod.METERED) {
        return data.chargeType === client_1.ChargeType.ELECTRICITY || data.chargeType === client_1.ChargeType.WATER;
    }
    return true;
}, {
    message: "Tính theo số đồng hồ (METERED) chỉ áp dụng cho Điện (ELECTRICITY) và Nước (WATER)",
    path: ["chargeMethod"],
})
    .refine((data) => {
    if (data.chargeMethod === client_1.ChargeMethod.FREE) {
        return data.unitPrice === 0;
    }
    return true;
}, {
    message: "Phương thức Miễn Phí (FREE) yêu cầu đơn giá phải bằng 0",
    path: ["unitPrice"],
})
    .refine((data) => {
    if (data.effectiveTo && data.effectiveFrom) {
        return data.effectiveTo.getTime() >= data.effectiveFrom.getTime();
    }
    return true;
}, {
    message: "Ngày kết thúc hiệu lực (effectiveTo) phải lớn hơn hoặc bằng ngày bắt đầu (effectiveFrom)",
    path: ["effectiveTo"],
});
