"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantProfileSelfServiceSchema = void 0;
const zod_1 = require("zod");
exports.tenantProfileSelfServiceSchema = zod_1.z.object({
    phone: zod_1.z.string().trim().regex(/^[0-9]{10,11}$/, "Số điện thoại liên hệ phải từ 10-11 chữ số").optional().or(zod_1.z.literal("")),
    permanentAddress: zod_1.z.string().trim().optional(),
    vehicleNumber: zod_1.z.string().trim().optional(),
    emergencyContactName: zod_1.z.string().trim().optional(),
    emergencyContactPhone: zod_1.z.string().trim().optional(),
});
