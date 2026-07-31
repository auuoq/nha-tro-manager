import { Building } from "../types/building.types";

export interface BuildingViewModel extends Building {
  displayAddress: string;
  roomCountDisplay: string;
}

export function adaptBuildingToViewModel(building: Building): BuildingViewModel {
  return {
    ...building,
    displayAddress: building.address || "Chưa cập nhật địa chỉ",
    roomCountDisplay: building.totalRooms !== undefined ? `${building.totalRooms} phòng` : "0 phòng",
  };
}
