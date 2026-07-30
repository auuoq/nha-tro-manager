"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordMeterReadingSchema = void 0;
const zod_1 = require("zod");
exports.recordMeterReadingSchema = zod_1.z
    .object({
    meterId: zod_1.z.string().uuid("ID đồng hồ không hợp lệ"),
    period: zod_1.z
        .string()
        .trim()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Kỳ chốt chỉ số phải đúng định dạng YYYY-MM (Ví dụ: 2026-07)"),
    previousValue: zod_1.z.number().min(0, "Chỉ số kỳ trước không được âm"),
    currentValue: zod_1.z.number().min(0, "Chỉ số kỳ này không được âm"),
    note: zod_1.z.string().trim().optional(),
    imageBase64: zod_1.z.string().optional(),
    originalFilename: zod_1.z.string().optional(),
})
    .refine((data) => data.currentValue >= data.previousValue, {
    message: "Chỉ số kỳ này (currentValue) phải lớn hơn hoặc bằng chỉ số kỳ trước (previousValue)",
    path: ["currentValue"],
});
