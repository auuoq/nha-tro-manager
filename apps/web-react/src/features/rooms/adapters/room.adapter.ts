import { Room } from "../types/room.types";
import { translateRoomStatus } from "@/shared/lib/formatters";

export interface RoomViewModel extends Room {
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  displayPrice: string;
}

export function adaptRoomToViewModel(room: Room): RoomViewModel {
  const { label, variant } = translateRoomStatus(room.status);
  return {
    ...room,
    statusLabel: label,
    statusVariant: variant,
    displayPrice: `${room.basePrice.toLocaleString("vi-VN")} ₫/tháng`,
  };
}
