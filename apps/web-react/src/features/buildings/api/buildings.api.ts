import { apiClient } from "@/api/client";
import { Building, BuildingCreateInput, BuildingUpdateInput } from "../types/building.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";
import { ChargeConfig, ChargeConfigCreateInput, ChargeConfigUpdateInput } from "@/shared/types/charge-config.types";

type BackendBuilding = Omit<
  Building,
  "bankAccount" | "accountHolder" | "wifiName" | "wifiPassword" | "totalRooms" | "activeContractsCount" | "chargeConfigs"
> & {
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  wifiInfo?: string | null;
  roomsCount?: number | null;
  activeContractsCount?: number | null;
  chargeConfigs?: Building["chargeConfigs"] | null;
};

type BackendChargeConfig = Omit<ChargeConfig, "unitPrice"> & {
  unitPrice: number | string;
};

const splitWifiInfo = (wifiInfo?: string | null) => {
  if (!wifiInfo) return { wifiName: null, wifiPassword: null };
  const [wifiName, ...passwordParts] = wifiInfo.split("|");
  return {
    wifiName: wifiName || wifiInfo,
    wifiPassword: passwordParts.join("|") || null,
  };
};

const joinWifiInfo = (data: BuildingCreateInput | BuildingUpdateInput) => {
  if (data.wifiName || data.wifiPassword) {
    return [data.wifiName || "", data.wifiPassword || ""].join("|");
  }
  return undefined;
};

const adaptBuilding = (building: BackendBuilding): Building => {
  const wifi = splitWifiInfo(building.wifiInfo);
  const roomsCount = building.roomsCount ?? 0;

  return {
    ...building,
    description: building.description ?? null,
    bankAccountNo: building.bankAccountNo ?? null,
    bankAccountName: building.bankAccountName ?? null,
    bankBin: building.bankBin ?? null,
    wifiInfo: building.wifiInfo ?? null,
    bankAccount: building.bankAccountNo ?? null,
    accountHolder: building.bankAccountName ?? null,
    wifiName: wifi.wifiName,
    wifiPassword: wifi.wifiPassword,
    rules: building.rules ?? null,
    roomsCount,
    totalRooms: roomsCount,
    activeContractsCount: building.activeContractsCount ?? 0,
    chargeConfigs: building.chargeConfigs ?? [],
  };
};

const adaptBuildingPayload = (data: BuildingCreateInput | BuildingUpdateInput) => ({
  name: data.name,
  address: data.address,
  description: data.description,
  bankName: data.bankName,
  bankAccountNo: data.bankAccount,
  bankAccountName: data.accountHolder,
  bankBin: data.bankBin,
  wifiInfo: joinWifiInfo(data),
  rules: data.rules,
});

const adaptChargeConfig = (config: BackendChargeConfig): ChargeConfig => ({
  ...config,
  unitPrice: Number(config.unitPrice),
  effectiveFrom: config.effectiveFrom?.slice(0, 10) ?? config.effectiveFrom,
  effectiveTo: config.effectiveTo?.slice(0, 10) ?? null,
});

const adaptChargeConfigPayload = (data: ChargeConfigCreateInput | ChargeConfigUpdateInput) => ({
  ...data,
  effectiveFrom: data.effectiveFrom ? `${data.effectiveFrom}T00:00:00Z` : undefined,
  effectiveTo: data.effectiveTo ? `${data.effectiveTo}T00:00:00Z` : data.effectiveTo,
});

export const buildingsApi = {
  list: async (params?: PaginationParams & { search?: string }): Promise<PaginatedData<Building>> => {
    const { search: _search, ...backendParams } = params ?? {};
    const res = await apiClient.get("/buildings", { params: backendParams });
    return {
      ...res.data.data,
      items: res.data.data.items.map(adaptBuilding),
    };
  },

  getById: async (id: string): Promise<Building> => {
    const res = await apiClient.get(`/buildings/${id}`);
    return adaptBuilding(res.data.data);
  },

  create: async (data: BuildingCreateInput): Promise<Building> => {
    const res = await apiClient.post("/buildings", adaptBuildingPayload(data));
    return adaptBuilding(res.data.data);
  },

  update: async (id: string, data: BuildingUpdateInput): Promise<Building> => {
    const res = await apiClient.patch(`/buildings/${id}`, adaptBuildingPayload(data));
    return adaptBuilding(res.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/buildings/${id}`);
  },

  // Building Charge Configs
  getChargeConfigs: async (buildingId: string): Promise<ChargeConfig[]> => {
    const res = await apiClient.get(`/buildings/${buildingId}/charge-configs`);
    return res.data.data.map(adaptChargeConfig);
  },

  createChargeConfig: async (buildingId: string, data: ChargeConfigCreateInput): Promise<ChargeConfig> => {
    const res = await apiClient.post(`/buildings/${buildingId}/charge-configs`, adaptChargeConfigPayload(data));
    return adaptChargeConfig(res.data.data);
  },

  updateChargeConfig: async (buildingId: string, configId: string, data: ChargeConfigUpdateInput): Promise<ChargeConfig> => {
    const res = await apiClient.patch(`/buildings/${buildingId}/charge-configs/${configId}`, adaptChargeConfigPayload(data));
    return adaptChargeConfig(res.data.data);
  },
};
