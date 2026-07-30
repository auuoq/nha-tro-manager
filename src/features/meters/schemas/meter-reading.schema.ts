import { z } from "zod";

export const recordMeterReadingSchema = z
  .object({
    meterId: z.string().uuid("ID đồng hồ không hợp lệ"),
    period: z
      .string()
      .trim()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Kỳ chốt chỉ số phải đúng định dạng YYYY-MM (Ví dụ: 2026-07)"),
    previousValue: z.number().min(0, "Chỉ số kỳ trước không được âm"),
    currentValue: z.number().min(0, "Chỉ số kỳ này không được âm"),
    note: z.string().trim().optional(),
    imageBase64: z.string().optional(),
    originalFilename: z.string().optional(),
  })
  .refine((data) => data.currentValue >= data.previousValue, {
    message: "Chỉ số kỳ này (currentValue) phải lớn hơn hoặc bằng chỉ số kỳ trước (previousValue)",
    path: ["currentValue"],
  });

export type RecordMeterReadingInput = z.infer<typeof recordMeterReadingSchema>;
