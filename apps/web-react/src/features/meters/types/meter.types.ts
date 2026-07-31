export type MeterType = "ELECTRICITY" | "WATER";

export interface Meter {
  id: string;
  roomId: string;
  roomNumber?: string;
  buildingId?: string;
  buildingName?: string;
  type: MeterType;
  serialNumber: string;
  initialReading: number;
  installedAt: string;
  removedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  latestReading?: number;
}

export interface MeterReading {
  id: string;
  meterId: string;
  period: string; // YYYY-MM
  previousValue: number;
  currentValue: number;
  consumption: number;
  note: string | null;
  imageUrl: string | null;
  recordedAt: string;
}

export interface CreateMeterInput {
  roomId: string;
  type: MeterType;
  serialNumber: string;
  initialReading: number;
  installedAt?: string;
}

export interface ReplaceMeterInput {
  newSerialNumber: string;
  newInitialReading: number;
  replacedAt?: string;
  reason?: string;
  note?: string;
}

export interface CreateMeterReadingInput {
  period: string;
  currentValue: number;
  note?: string | null;
  imageUrl?: string | null;
}
