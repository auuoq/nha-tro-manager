export interface RoomAsset {
  id: string;
  roomId: string;
  name: string;
  quantity: number;
  condition: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAssetCreateInput {
  name: string;
  quantity: number;
  condition?: string | null;
  note?: string | null;
}

export interface RoomAssetUpdateInput extends Partial<RoomAssetCreateInput> {}
