import { MeterType, MeterReadingStatus } from "@prisma/client";

export interface MeterDTO {
  id: string;
  roomId: string;
  buildingName: string;
  roomNumber: string;
  type: MeterType;
  serialNumber: string;
  initialReading: number;
  installedAt: Date;
  removedAt: Date | null;
  isActive: boolean;
  note: string | null;
  lastReadingValue: number | null;
  lastReadingPeriod: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeterReadingDTO {
  id: string;
  meterId: string;
  meterType: MeterType;
  serialNumber: string;
  roomNumber: string;
  buildingName: string;
  period: string;
  previousValue: number;
  currentValue: number;
  consumption: number;
  imagePath: string | null;
  note: string | null;
  status: MeterReadingStatus;
  recordedByName: string;
  recordedAt: Date;
  createdAt: Date;
}
