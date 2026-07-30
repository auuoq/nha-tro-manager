"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelContractSchema = exports.terminateContractSchema = exports.updateContractSchema = exports.createContractSchema = void 0;
const zod_1 = require("zod");
exports.createContractSchema = zod_1.z
    .object({
    roomId: zod_1.z.string().uuid("ID phòng không hợp lệ"),
    primaryTenantId: zod_1.z.string().uuid("Khách thuê đại diện (PRIMARY) không được để trống"),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    depositAmount: zod_1.z.number().min(0, "Tiền đặt cọc không được âm"),
    monthlyPrice: zod_1.z.number().gt(0, "Giá thuê hàng tháng phải lớn hơn 0 VNĐ"),
    billingDay: zod_1.z
        .number()
        .int()
        .min(1, "Ngày chốt tiền phòng từ ngày 1 đến 28")
        .max(28, "Ngày chốt tiền phòng từ ngày 1 đến 28")
        .default(5),
    notes: zod_1.z.string().trim().optional(),
    initialMemberTenantIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
})
    .refine((data) => data.startDate.getTime() < data.endDate.getTime(), {
    message: "Ngày bắt đầu hợp đồng (startDate) phải trước ngày kết thúc (endDate)",
    path: ["endDate"],
});
exports.updateContractSchema = zod_1.z.object({
    contractId: zod_1.z.string().uuid("ID hợp đồng không hợp lệ"),
    startDate: zod_1.z.date().optional(),
    endDate: zod_1.z.date().optional(),
    depositAmount: zod_1.z.number().min(0).optional(),
    monthlyPrice: zod_1.z.number().gt(0).optional(),
    billingDay: zod_1.z.number().int().min(1).max(28).optional(),
    notes: zod_1.z.string().trim().optional(),
});
exports.terminateContractSchema = zod_1.z.object({
    contractId: zod_1.z.string().uuid("ID hợp đồng không hợp lệ"),
    terminationDate: zod_1.z.date().default(() => new Date()),
    terminationReason: zod_1.z.string().trim().min(1, "Vui lòng nhập lý do thanh lý hợp đồng"),
    actualMoveOutDate: zod_1.z.date().default(() => new Date()),
    depositReturnedAmount: zod_1.z.number().min(0, "Số tiền cọc hoàn trả không được âm").default(0),
    depositDeductionAmount: zod_1.z.number().min(0, "Số tiền khấu trừ cọc không được âm").default(0),
});
exports.cancelContractSchema = zod_1.z.object({
    contractId: zod_1.z.string().uuid("ID hợp đồng không hợp lệ"),
    cancellationReason: zod_1.z.string().trim().min(1, "Vui lòng nhập lý do hủy hợp đồng DRAFT"),
});
