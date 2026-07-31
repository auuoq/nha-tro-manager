import { describe, it, expect } from "vitest";
import { translateContractStatus, translateUserRole } from "@/shared/lib/formatters";

describe("Phase F3 Contracts & Tenants Business Logic Unit Tests", () => {
  it("should correctly translate contract statuses for UI badges", () => {
    expect(translateContractStatus("DRAFT")).toEqual({ label: "Nháp", variant: "neutral" });
    expect(translateContractStatus("ACTIVE")).toEqual({ label: "Đang hiệu lực", variant: "success" });
    expect(translateContractStatus("EXPIRING")).toEqual({ label: "Sắp hết hạn", variant: "warning" });
    expect(translateContractStatus("TERMINATED")).toEqual({ label: "Đã kết thúc", variant: "neutral" });
    expect(translateContractStatus("CANCELLED")).toEqual({ label: "Đã hủy", variant: "danger" });
  });

  it("should correctly translate user roles", () => {
    expect(translateUserRole("SUPER_ADMIN")).toBe("Quản trị hệ thống");
    expect(translateUserRole("OWNER")).toBe("Chủ nhà");
    expect(translateUserRole("TENANT")).toBe("Khách thuê");
  });
});
