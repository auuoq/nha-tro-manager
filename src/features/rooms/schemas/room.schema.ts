import { z } from "zod";

export const createRoomSchema = z.object({
  buildingId: z.string().uuid("ID tòa nhà không hợp lệ"),
  roomNumber: z.string().trim().min(1, "Số phòng không được để trống"),
  floor: z.number().int("Tầng phải là số nguyên").min(0, "Số tầng không được âm"),
  roomType: z.string().trim().min(1, "Loại phòng không được để trống"),
  basePrice: z.number().min(0, "Giá thuê cơ bản không được âm"),
  areaSqM: z.number().gt(0, "Diện tích phòng phải lớn hơn 0 m²"),
  initialAssets: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Tên tài sản không được để trống"),
        assetCode: z.string().trim().optional(),
        condition: z.string().default("GOOD"),
      })
    )
    .optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = z.object({
  roomId: z.string().uuid("ID phòng không hợp lệ"),
  roomNumber: z.string().trim().min(1, "Số phòng không được để trống").optional(),
  floor: z.number().int().min(0).optional(),
  roomType: z.string().trim().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  areaSqM: z.number().gt(0).optional(),
});

export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
