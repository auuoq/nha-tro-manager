import { z } from "zod";

export const addManualInvoiceItemSchema = z.object({
  invoiceId: z.string().uuid("ID hóa đơn không hợp lệ"),
  description: z.string().trim().min(1, "Mô tả khoản thu không được để trống"),
  quantity: z.number().gt(0, "Số lượng phải lớn hơn 0"),
  unit: z.string().trim().default("khoản"),
  unitPrice: z.number().min(0, "Đơn giá không được âm"),
});

export type AddManualInvoiceItemInput = z.infer<typeof addManualInvoiceItemSchema>;
