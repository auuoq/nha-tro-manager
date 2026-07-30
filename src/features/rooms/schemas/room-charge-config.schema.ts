import { z } from "zod";
import { ChargeType, ChargeMethod } from "@prisma/client";

export const roomChargeConfigSchema = z
  .object({
    chargeType: z.nativeEnum(ChargeType),
    chargeMethod: z.nativeEnum(ChargeMethod),
    unitPrice: z.number().min(0, "Đơn giá không được âm"),
    effectiveFrom: z.date().default(() => new Date()),
    effectiveTo: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.chargeMethod === ChargeMethod.METERED) {
        return data.chargeType === ChargeType.ELECTRICITY || data.chargeType === ChargeType.WATER;
      }
      return true;
    },
    {
      message: "Tính theo số đồng hồ (METERED) chỉ áp dụng cho Điện (ELECTRICITY) và Nước (WATER)",
      path: ["chargeMethod"],
    }
  )
  .refine(
    (data) => {
      if (data.chargeMethod === ChargeMethod.FREE) {
        return data.unitPrice === 0;
      }
      return true;
    },
    {
      message: "Phương thức Miễn Phí (FREE) yêu cầu đơn giá phải bằng 0",
      path: ["unitPrice"],
    }
  )
  .refine(
    (data) => {
      if (data.effectiveTo && data.effectiveFrom) {
        return data.effectiveTo.getTime() >= data.effectiveFrom.getTime();
      }
      return true;
    },
    {
      message: "Ngày kết thúc hiệu lực (effectiveTo) phải lớn hơn hoặc bằng ngày bắt đầu (effectiveFrom)",
      path: ["effectiveTo"],
    }
  );

export type RoomChargeConfigInput = z.infer<typeof roomChargeConfigSchema>;
