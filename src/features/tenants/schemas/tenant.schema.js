"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantSchema = exports.createTenantSchema = void 0;
const zod_1 = require("zod");
exports.createTenantSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Họ tên khách thuê phải từ 2 ký tự trở lên"),
    phone: zod_1.z.string().trim().regex(/^[0-9]{10,11}$/, "Số điện thoại phải từ 10-11 chữ số").optional().or(zod_1.z.literal("")),
    dateOfBirth: zod_1.z.date().optional().nullable(),
    gender: zod_1.z.string().trim().optional(),
    idCardNumber: zod_1.z.string().trim().regex(/^[0-9]{9,12}$/, "Số CCCD/CMND phải gồm 9-12 chữ số").optional().or(zod_1.z.literal("")),
    idCardIssuedDate: zod_1.z.date().optional().nullable(),
    idCardIssuedPlace: zod_1.z.string().trim().optional(),
    hometown: zod_1.z.string().trim().optional(),
    permanentAddress: zod_1.z.string().trim().optional(),
    vehicleNumber: zod_1.z.string().trim().optional(),
    emergencyContactName: zod_1.z.string().trim().optional(),
    emergencyContactPhone: zod_1.z.string().trim().optional(),
});
exports.updateTenantSchema = exports.createTenantSchema.partial().extend({
    tenantId: zod_1.z.string().uuid("ID khách thuê không hợp lệ"),
});
