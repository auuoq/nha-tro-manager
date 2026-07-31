import { describe, it, expect } from "vitest";
import { adaptBuildingToViewModel } from "../adapters/building.adapter";
import { adaptRoomToViewModel } from "@/features/rooms/adapters/room.adapter";
import { translateChargeType, translateChargeMethod } from "@/shared/adapters/charge-config.adapter";

describe("Phase F2 Adapters & Business Validation Unit Tests", () => {
  it("should correctly adapt building to view model", () => {
    const building = {
      id: "bld-1",
      name: "Tòa Yên Hòa 1",
      address: "123 Cầu Giấy",
      bankAccount: "0987654321",
      bankName: "MBBank",
      accountHolder: "NGUYEN VAN A",
      wifiName: "YenHoa_Wifi",
      wifiPassword: "pass",
      rules: null,
      ownerId: "owner-1",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      totalRooms: 10,
    };

    const vm = adaptBuildingToViewModel(building);
    expect(vm.displayAddress).toBe("123 Cầu Giấy");
    expect(vm.roomCountDisplay).toBe("10 phòng");
  });

  it("should correctly adapt room to view model", () => {
    const room = {
      id: "room-1",
      buildingId: "bld-1",
      roomNumber: "101",
      floor: 1,
      area: 25,
      basePrice: 3500000,
      maxTenants: 2,
      status: "VACANT" as const,
      description: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    const vm = adaptRoomToViewModel(room);
    expect(vm.statusLabel).toBe("Còn trống");
    expect(vm.displayPrice).toBe("3.500.000 ₫/tháng");
  });

  it("should correctly translate charge config types and methods", () => {
    expect(translateChargeType("ELECTRICITY")).toBe("Tiền điện");
    expect(translateChargeType("WATER")).toBe("Tiền nước");
    expect(translateChargeMethod("METERED")).toBe("Theo chỉ số đồng hồ");
    expect(translateChargeMethod("FREE")).toBe("Miễn phí");
  });
});
