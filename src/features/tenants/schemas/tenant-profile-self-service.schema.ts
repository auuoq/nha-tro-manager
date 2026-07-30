import { z } from "zod";

export const tenantProfileSelfServiceSchema = z.object({
  phone: z.string().trim().regex(/^[0-9]{10,11}$/, "Số điện thoại liên hệ phải từ 10-11 chữ số").optional().or(z.literal("")),
  permanentAddress: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z.string().trim().optional(),
});

export type TenantProfileSelfServiceInput = z.infer<typeof tenantProfileSelfServiceSchema>;
