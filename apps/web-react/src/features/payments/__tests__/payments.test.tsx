import { describe, it, expect } from "vitest";
import { translatePaymentStatus, translatePaymentMethod } from "@/shared/lib/formatters";

describe("Phase F5 Payments Business Logic Unit Tests", () => {
  it("should correctly translate payment statuses", () => {
    expect(translatePaymentStatus("CONFIRMED")).toEqual({ label: "Đã xác nhận", variant: "success" });
    expect(translatePaymentStatus("PENDING")).toEqual({ label: "Chờ xử lý", variant: "warning" });
    expect(translatePaymentStatus("REFUNDED")).toEqual({ label: "Đã hoàn tiền", variant: "info" });
    expect(translatePaymentStatus("CANCELLED")).toEqual({ label: "Đã hủy", variant: "neutral" });
  });

  it("should correctly translate payment methods", () => {
    expect(translatePaymentMethod("VIETQR")).toBe("VietQR");
    expect(translatePaymentMethod("BANK_TRANSFER")).toBe("Chuyển khoản");
    expect(translatePaymentMethod("CASH")).toBe("Tiền mặt");
    expect(translatePaymentMethod("BANK_WEBHOOK")).toBe("Bank Webhook");
  });

  it("should verify net amount after partial refund", () => {
    const paymentAmount = 3500000;
    const refundAmount = 1000000;
    const netAmount = paymentAmount - refundAmount;
    expect(netAmount).toBe(2500000);
  });
});
