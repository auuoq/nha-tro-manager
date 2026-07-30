import { ChargeMethod, ChargeType, RoomStatus } from "@prisma/client";

export interface RoomAssetDTO {
  id: string;
  roomId: string;
  name: string;
  assetCode: string | null;
  condition: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomChargeConfigDTO {
  id: string;
  chargeType: ChargeType;
  chargeMethod: ChargeMethod;
  unitPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

export interface RoomItemDTO {
  id: string;
  buildingId: string;
  buildingName: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  basePrice: number;
  areaSqM: number;
  status: RoomStatus;
  assetsCount: number;
  hasChargeConfig: boolean;
  activeContractId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomDetailDTO extends RoomItemDTO {
  assets: RoomAssetDTO[];
  chargeConfigs: RoomChargeConfigDTO[];
  buildingDefaultChargeConfigs: RoomChargeConfigDTO[];
}
