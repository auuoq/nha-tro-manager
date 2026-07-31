export type ChargeType = "ELECTRICITY" | "WATER" | "WIFI" | "GARBAGE" | "PARKING" | "OTHER";
export type ChargeMethod = "METERED" | "PER_PERSON" | "PER_ROOM" | "FREE";

export interface ChargeConfig {
  id: string;
  buildingId: string | null;
  roomId: string | null;
  contractId: string | null;
  chargeType: ChargeType;
  chargeMethod: ChargeMethod;
  unitPrice: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChargeConfigCreateInput {
  chargeType: ChargeType;
  chargeMethod: ChargeMethod;
  unitPrice: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface ChargeConfigUpdateInput extends Partial<ChargeConfigCreateInput> {}
