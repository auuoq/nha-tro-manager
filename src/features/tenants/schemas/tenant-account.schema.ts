import { z } from "zod";

export const createTenantAccountSchema = z.object({
  tenantId: z.string().uuid("ID khách thuê không hợp lệ"),
  phone: z.string().trim().regex(/^[0-9]{10,11}$/, "Số điện thoại đăng nhập phải từ 10-11 chữ số"),
  email: z.string().trim().email("Email không đúng định dạng").optional().or(z.literal("")),
});

export type CreateTenantAccountInput = z.infer<typeof createTenantAccountSchema>;
