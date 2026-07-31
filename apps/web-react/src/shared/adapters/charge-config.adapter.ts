import { ChargeType, ChargeMethod } from "@/shared/types/charge-config.types";

export function translateChargeType(type: ChargeType): string {
  switch (type) {
    case "ELECTRICITY": return "Tiền điện";
    case "WATER": return "Tiền nước";
    case "WIFI": return "Tiền Wifi";
    case "GARBAGE": return "Tiền rác";
    case "PARKING": return "Tiền gửi xe";
    case "OTHER": return "Phí khác";
    default: return type;
  }
}

export function translateChargeMethod(method: ChargeMethod): string {
  switch (method) {
    case "METERED": return "Theo chỉ số đồng hồ";
    case "PER_PERSON": return "Theo đầu người";
    case "PER_ROOM": return "Cố định / phòng";
    case "FREE": return "Miễn phí";
    default: return method;
  }
}
