import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const recordManualPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Vui lòng chọn Hóa đơn"),
  amount: z.number().positive("Số tiền thanh toán phải lớn hơn 0"),
  method: z.nativeEnum(PaymentMethod).refine(
    (val) => val === PaymentMethod.CASH || val === PaymentMethod.BANK_TRANSFER || val === PaymentMethod.OTHER,
    { message: "Phương thức thủ công phải là CASH, BANK_TRANSFER hoặc OTHER" }
  ),
  notes: z.string().optional(),
  transactionRef: z.string().optional(),
});

export type RecordManualPaymentInput = z.infer<typeof recordManualPaymentSchema>;

export const cancelPaymentSchema = z.object({
  paymentId: z.string().min(1, "Vui lòng chọn giao dịch thanh toán"),
  cancellationReason: z.string().min(3, "Lý do hủy phải từ 3 ký tự trở lên"),
});

export type CancelPaymentInput = z.infer<typeof cancelPaymentSchema>;

export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1, "Vui lòng chọn giao dịch thanh toán"),
  refundAmount: z.number().positive("Số tiền hoàn trả phải lớn hơn 0"),
  refundReason: z.string().min(3, "Lý do hoàn tiền phải từ 3 ký tự trở lên"),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
