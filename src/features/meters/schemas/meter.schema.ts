import { z } from "zod";
import { MeterType } from "@prisma/client";

export const createMeterSchema = z.object({
  roomId: z.string().uuid("ID phòng không hợp lệ"),
  type: z.nativeEnum(MeterType),
  serialNumber: z.string().trim().min(1, "Mã/Số serial đồng hồ không được để trống"),
  initialReading: z.number().min(0, "Chỉ số ban đầu không được âm").default(0),
  installedAt: z.date().default(() => new Date()),
  note: z.string().trim().optional(),
});

export type CreateMeterInput = z.infer<typeof createMeterSchema>;

export const replaceMeterSchema = z.object({
  oldMeterId: z.string().uuid("ID đồng hồ cũ không hợp lệ"),
  newSerialNumber: z.string().trim().min(1, "Mã serial đồng hồ mới không được để trống"),
  newInitialReading: z.number().min(0, "Chỉ số khởi tạo đồng hồ mới không được âm").default(0),
  reason: z.string().trim().min(1, "Lý do thay đồng hồ không được để trống"),
  replacedAt: z.date().default(() => new Date()),
});

export type ReplaceMeterInput = z.infer<typeof replaceMeterSchema>;
