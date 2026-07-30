"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyInvoiceDiscountSchema = exports.createDraftInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createDraftInvoiceSchema = zod_1.z.object({
    contractId: zod_1.z.string().uuid("ID hợp đồng không hợp lệ"),
    billingPeriod: zod_1.z
        .string()
        .trim()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Kỳ hóa đơn phải có định dạng YYYY-MM (Ví dụ: 2026-07)"),
});
exports.applyInvoiceDiscountSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid("ID hóa đơn không hợp lệ"),
    discountAmount: zod_1.z.number().min(0, "Số tiền giảm giá không được âm"),
    reason: zod_1.z.string().trim().optional(),
});
