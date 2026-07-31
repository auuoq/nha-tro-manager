export type RoomStatus = "VACANT" | "RESERVED" | "RENTED" | "MAINTENANCE";

export interface Room {
  id: string;
  buildingId: string;
  roomNumber: string;
  floor: number;
  area: number;
  basePrice: number;
  maxTenants: number;
  status: RoomStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  buildingName?: string;
}

export interface RoomCreateInput {
  buildingId: string;
  roomNumber: string;
  floor: number;
  area: number;
  basePrice: number;
  maxTenants: number;
  description?: string | null;
}

export interface RoomUpdateInput extends Partial<RoomCreateInput> {}
