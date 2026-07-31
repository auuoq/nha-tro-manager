export interface Building {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  description?: string | null;
  bankAccount: string | null;
  bankName: string | null;
  accountHolder: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  bankBin?: string | null;
  wifiInfo?: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  rules: string | null;
  createdAt: string;
  updatedAt: string;
  totalRooms?: number;
  roomsCount?: number;
  activeContractsCount?: number;
  chargeConfigs?: {
    id: string;
    chargeType: string;
    unitPrice: number;
  }[];
}

export interface BuildingCreateInput {
  name: string;
  address: string;
  description?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  accountHolder?: string | null;
  bankBin?: string | null;
  wifiName?: string | null;
  wifiPassword?: string | null;
  rules?: string | null;
}

export interface BuildingUpdateInput extends Partial<BuildingCreateInput> {}
