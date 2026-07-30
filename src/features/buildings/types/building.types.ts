import { ChargeMethod, ChargeType } from "@prisma/client";

export interface BuildingChargeConfigDTO {
  id: string;
  chargeType: ChargeType;
  chargeMethod: ChargeMethod;
  unitPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

export interface BuildingItemDTO {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  description: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
  bankBin: string | null;
  wifiInfo: string | null;
  rules: string | null;
  createdAt: Date;
  updatedAt: Date;
  roomsCount: number;
  activeContractsCount: number;
  chargeConfigs: BuildingChargeConfigDTO[];
}

export interface BuildingDetailDTO extends BuildingItemDTO {
  rooms: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType: string;
    basePrice: number;
    status: string;
  }[];
}
