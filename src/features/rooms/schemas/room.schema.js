"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
exports.createRoomSchema = zod_1.z.object({
    buildingId: zod_1.z.string().uuid("ID tòa nhà không hợp lệ"),
    roomNumber: zod_1.z.string().trim().min(1, "Số phòng không được để trống"),
    floor: zod_1.z.number().int("Tầng phải là số nguyên").min(0, "Số tầng không được âm"),
    roomType: zod_1.z.string().trim().min(1, "Loại phòng không được để trống"),
    basePrice: zod_1.z.number().min(0, "Giá thuê cơ bản không được âm"),
    areaSqM: zod_1.z.number().gt(0, "Diện tích phòng phải lớn hơn 0 m²"),
    initialAssets: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().trim().min(1, "Tên tài sản không được để trống"),
        assetCode: zod_1.z.string().trim().optional(),
        condition: zod_1.z.string().default("GOOD"),
    }))
        .optional(),
});
exports.updateRoomSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("ID phòng không hợp lệ"),
    roomNumber: zod_1.z.string().trim().min(1, "Số phòng không được để trống").optional(),
    floor: zod_1.z.number().int().min(0).optional(),
    roomType: zod_1.z.string().trim().min(1).optional(),
    basePrice: zod_1.z.number().min(0).optional(),
    areaSqM: zod_1.z.number().gt(0).optional(),
});
