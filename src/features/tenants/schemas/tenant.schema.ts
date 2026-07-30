import { z } from "zod";

export const createTenantSchema = z.object({
  fullName: z.string().trim().min(2, "Họ tên khách thuê phải từ 2 ký tự trở lên"),
  phone: z.string().trim().regex(/^[0-9]{10,11}$/, "Số điện thoại phải từ 10-11 chữ số").optional().or(z.literal("")),
  dateOfBirth: z.date().optional().nullable(),
  gender: z.string().trim().optional(),
  idCardNumber: z.string().trim().regex(/^[0-9]{9,12}$/, "Số CCCD/CMND phải gồm 9-12 chữ số").optional().or(z.literal("")),
  idCardIssuedDate: z.date().optional().nullable(),
  idCardIssuedPlace: z.string().trim().optional(),
  hometown: z.string().trim().optional(),
  permanentAddress: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z.string().trim().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = createTenantSchema.partial().extend({
  tenantId: z.string().uuid("ID khách thuê không hợp lệ"),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
