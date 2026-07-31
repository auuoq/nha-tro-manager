export interface Building {
  id: string;
  name: string;
  address: string;
  bankAccount: string | null;
  bankName: string | null;
  accountHolder: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  rules: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  totalRooms?: number;
}

export interface BuildingCreateInput {
  name: string;
  address: string;
  bankAccount?: string | null;
  bankName?: string | null;
  accountHolder?: string | null;
  wifiName?: string | null;
  wifiPassword?: string | null;
  rules?: string | null;
}

export interface BuildingUpdateInput extends Partial<BuildingCreateInput> {}
