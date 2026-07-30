import { z } from "zod";

export const createContractSchema = z
  .object({
    roomId: z.string().uuid("ID phòng không hợp lệ"),
    primaryTenantId: z.string().uuid("Khách thuê đại diện (PRIMARY) không được để trống"),
    startDate: z.date(),
    endDate: z.date(),
    depositAmount: z.number().min(0, "Tiền đặt cọc không được âm"),
    monthlyPrice: z.number().gt(0, "Giá thuê hàng tháng phải lớn hơn 0 VNĐ"),
    billingDay: z
      .number()
      .int()
      .min(1, "Ngày chốt tiền phòng từ ngày 1 đến 28")
      .max(28, "Ngày chốt tiền phòng từ ngày 1 đến 28")
      .default(5),
    notes: z.string().trim().optional(),
    initialMemberTenantIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => data.startDate.getTime() < data.endDate.getTime(),
    {
      message: "Ngày bắt đầu hợp đồng (startDate) phải trước ngày kết thúc (endDate)",
      path: ["endDate"],
    }
  );

export type CreateContractInput = z.infer<typeof createContractSchema>;

export const updateContractSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  depositAmount: z.number().min(0).optional(),
  monthlyPrice: z.number().gt(0).optional(),
  billingDay: z.number().int().min(1).max(28).optional(),
  notes: z.string().trim().optional(),
});

export type UpdateContractInput = z.infer<typeof updateContractSchema>;

export const terminateContractSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  terminationDate: z.date().default(() => new Date()),
  terminationReason: z.string().trim().min(1, "Vui lòng nhập lý do thanh lý hợp đồng"),
  actualMoveOutDate: z.date().default(() => new Date()),
  depositReturnedAmount: z.number().min(0, "Số tiền cọc hoàn trả không được âm").default(0),
  depositDeductionAmount: z.number().min(0, "Số tiền khấu trừ cọc không được âm").default(0),
});

export type TerminateContractInput = z.infer<typeof terminateContractSchema>;

export const cancelContractSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  cancellationReason: z.string().trim().min(1, "Vui lòng nhập lý do hủy hợp đồng DRAFT"),
});

export type CancelContractInput = z.infer<typeof cancelContractSchema>;
