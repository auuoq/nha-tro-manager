"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceMeterSchema = exports.createMeterSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createMeterSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("ID phòng không hợp lệ"),
    type: zod_1.z.nativeEnum(client_1.MeterType),
    serialNumber: zod_1.z.string().trim().min(1, "Mã/Số serial đồng hồ không được để trống"),
    initialReading: zod_1.z.number().min(0, "Chỉ số ban đầu không được âm").default(0),
    installedAt: zod_1.z.date().default(() => new Date()),
    note: zod_1.z.string().trim().optional(),
});
exports.replaceMeterSchema = zod_1.z.object({
    oldMeterId: zod_1.z.string().uuid("ID đồng hồ cũ không hợp lệ"),
    newSerialNumber: zod_1.z.string().trim().min(1, "Mã serial đồng hồ mới không được để trống"),
    newInitialReading: zod_1.z.number().min(0, "Chỉ số khởi tạo đồng hồ mới không được âm").default(0),
    reason: zod_1.z.string().trim().min(1, "Lý do thay đồng hồ không được để trống"),
    replacedAt: zod_1.z.date().default(() => new Date()),
});
