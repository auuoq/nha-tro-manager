"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBuildingSchema = exports.createBuildingSchema = void 0;
const zod_1 = require("zod");
const building_charge_config_schema_1 = require("./building-charge-config.schema");
exports.createBuildingSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Tên tòa nhà phải từ 2 ký tự trở lên (không tính khoảng trắng thừa)"),
    address: zod_1.z.string().trim().min(5, "Địa chỉ phải từ 5 ký tự trở lên"),
    description: zod_1.z.string().trim().optional(),
    bankName: zod_1.z.string().trim().optional(),
    bankAccountNo: zod_1.z.string().trim().regex(/^[0-9A-Za-z-]*$/, "Số tài khoản chứa ký tự không hợp lệ").optional(),
    bankAccountName: zod_1.z.string().trim().optional(),
    bankBin: zod_1.z.string().trim().regex(/^[0-9]{3,8}$/, "Mã BIN ngân hàng phải gồm 3-8 chữ số").optional().or(zod_1.z.literal("")),
    wifiInfo: zod_1.z.string().trim().optional(),
    rules: zod_1.z.string().trim().optional(),
    initialChargeConfigs: zod_1.z.array(building_charge_config_schema_1.buildingChargeConfigSchema).optional(),
});
exports.updateBuildingSchema = exports.createBuildingSchema.partial().extend({
    buildingId: zod_1.z.string().uuid("ID tòa nhà không hợp lệ"),
});
