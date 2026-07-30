import { z } from "zod";

export const createDraftInvoiceSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  billingPeriod: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Kỳ hóa đơn phải có định dạng YYYY-MM (Ví dụ: 2026-07)"),
});

export type CreateDraftInvoiceInput = z.infer<typeof createDraftInvoiceSchema>;

export const applyInvoiceDiscountSchema = z.object({
  invoiceId: z.string().uuid("ID hóa đơn không hợp lệ"),
  discountAmount: z.number().min(0, "Số tiền giảm giá không được âm"),
  reason: z.string().trim().optional(),
});

export type ApplyInvoiceDiscountInput = z.infer<typeof applyInvoiceDiscountSchema>;
