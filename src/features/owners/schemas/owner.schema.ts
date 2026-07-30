import { z } from "zod";

export const createOwnerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải từ 2 ký tự trở lên"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại phải từ 10-11 chữ số"),
  email: z.string().email("Email không đúng định dạng").optional().or(z.literal("")),
  businessName: z.string().optional(),
  taxCode: z.string().optional(),
  address: z.string().optional(),
});

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;

export const updateOwnerStatusSchema = z.object({
  ownerUserId: z.string().uuid("ID tài khoản không hợp lệ"),
  status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]),
  reason: z.string().optional(),
});

export type UpdateOwnerStatusInput = z.infer<typeof updateOwnerStatusSchema>;
