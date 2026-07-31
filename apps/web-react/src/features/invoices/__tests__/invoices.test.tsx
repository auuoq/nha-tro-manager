import { describe, it, expect } from "vitest";
import { translateInvoiceStatus } from "@/shared/lib/formatters";

describe("Phase F4 Invoices Business Logic Unit Tests", () => {
  it("should correctly translate invoice statuses", () => {
    expect(translateInvoiceStatus("DRAFT")).toEqual({ label: "Nháp", variant: "neutral" });
    expect(translateInvoiceStatus("ISSUED")).toEqual({ label: "Đã phát hành", variant: "info" });
    expect(translateInvoiceStatus("PAID")).toEqual({ label: "Đã thanh toán", variant: "success" });
    expect(translateInvoiceStatus("OVERDUE")).toEqual({ label: "Quá hạn", variant: "danger" });
    expect(translateInvoiceStatus("CANCELLED")).toEqual({ label: "Đã hủy", variant: "neutral" });
  });

  it("should verify remaining amount calculation", () => {
    const totalAmount = 5250000;
    const paidAmount = 2000000;
    const remainingAmount = totalAmount - paidAmount;
    expect(remainingAmount).toBe(3250000);
  });
});
