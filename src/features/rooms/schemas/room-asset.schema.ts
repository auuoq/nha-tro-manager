import { z } from "zod";

export const roomAssetSchema = z.object({
  name: z.string().trim().min(1, "Tên trang thiết bị/tài sản không được để trống"),
  assetCode: z.string().trim().optional(),
  condition: z.string().trim().default("GOOD"),
});

export type RoomAssetInput = z.infer<typeof roomAssetSchema>;
