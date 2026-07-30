import { z } from "zod";
import { buildingChargeConfigSchema } from "./building-charge-config.schema";

export const createBuildingSchema = z.object({
  name: z.string().trim().min(2, "Tên tòa nhà phải từ 2 ký tự trở lên (không tính khoảng trắng thừa)"),
  address: z.string().trim().min(5, "Địa chỉ phải từ 5 ký tự trở lên"),
  description: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bankAccountNo: z.string().trim().regex(/^[0-9A-Za-z-]*$/, "Số tài khoản chứa ký tự không hợp lệ").optional(),
  bankAccountName: z.string().trim().optional(),
  bankBin: z.string().trim().regex(/^[0-9]{3,8}$/, "Mã BIN ngân hàng phải gồm 3-8 chữ số").optional().or(z.literal("")),
  wifiInfo: z.string().trim().optional(),
  rules: z.string().trim().optional(),
  initialChargeConfigs: z.array(buildingChargeConfigSchema).optional(),
});

export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;

export const updateBuildingSchema = createBuildingSchema.partial().extend({
  buildingId: z.string().uuid("ID tòa nhà không hợp lệ"),
});

export type UpdateBuildingInput = z.infer<typeof updateBuildingSchema>;
