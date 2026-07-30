import { prisma } from "@/server/database/prisma";
import { ContractDetailDTO, ContractItemDTO } from "../types/contract.types";

export async function findContractsByOwner(ownerUserId: string): Promise<ContractItemDTO[]> {
  const contracts = await prisma.contract.findMany({
    where: {
      room: {
        building: {
          ownerId: ownerUserId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      room: {
        select: {
          buildingId: true,
          roomNumber: true,
          building: { select: { name: true } },
        },
      },
      contractTenants: {
        where: { leftAt: null },
        include: {
          tenant: { select: { fullName: true } },
        },
      },
    },
  });

  return contracts.map((c) => {
    const primary = c.contractTenants.find((ct) => ct.role === "PRIMARY") || c.contractTenants[0];
    return {
      id: c.id,
      roomId: c.roomId,
      buildingName: c.room.building.name,
      roomNumber: c.room.roomNumber,
      contractCode: c.contractCode,
      startDate: c.startDate,
      endDate: c.endDate,
      actualMoveInDate: c.actualMoveInDate,
      actualMoveOutDate: c.actualMoveOutDate,
      depositAmount: Number(c.depositAmount),
      monthlyPrice: Number(c.monthlyPrice),
      billingDay: c.billingDay,
      status: c.status,
      primaryTenantName: primary?.tenant.fullName || "Chưa gán",
      tenantsCount: c.contractTenants.length,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  });
}

export async function findContractDetail(contractId: string, ownerUserId: string): Promise<ContractDetailDTO | null> {
  const c = await prisma.contract.findFirst({
    where: {
      id: contractId,
      room: {
        building: {
          ownerId: ownerUserId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      room: {
        select: {
          buildingId: true,
          roomNumber: true,
          building: {
            select: {
              name: true,
              chargeConfigs: {
                where: { roomId: null, contractId: null },
                orderBy: { effectiveFrom: "desc" },
              },
            },
          },
          chargeConfigs: {
            where: { contractId: null },
            orderBy: { effectiveFrom: "desc" },
          },
        },
      },
      contractTenants: {
        orderBy: { joinedAt: "asc" },
        include: {
          tenant: {
            select: { fullName: true, phone: true, idCardNumber: true },
          },
        },
      },
      chargeConfigs: {
        orderBy: { effectiveFrom: "desc" },
      },
    },
  });

  if (!c) return null;

  const primary = c.contractTenants.find((ct) => ct.role === "PRIMARY" && !ct.leftAt) || c.contractTenants[0];

  return {
    id: c.id,
    roomId: c.roomId,
    buildingName: c.room.building.name,
    roomNumber: c.room.roomNumber,
    contractCode: c.contractCode,
    startDate: c.startDate,
    endDate: c.endDate,
    actualMoveInDate: c.actualMoveInDate,
    actualMoveOutDate: c.actualMoveOutDate,
    depositAmount: Number(c.depositAmount),
    monthlyPrice: Number(c.monthlyPrice),
    billingDay: c.billingDay,
    status: c.status,
    primaryTenantName: primary?.tenant.fullName || "Chưa gán",
    tenantsCount: c.contractTenants.filter((ct) => !ct.leftAt).length,
    cancellationReason: c.cancellationReason,
    terminationDate: c.terminationDate,
    terminationReason: c.terminationReason,
    depositReturnedAmount: Number(c.depositReturnedAmount),
    depositDeductionAmount: Number(c.depositDeductionAmount),
    documentPath: c.documentPath,
    notes: c.notes,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    tenants: c.contractTenants.map((ct) => ({
      id: ct.id,
      contractId: ct.contractId,
      tenantId: ct.tenantId,
      tenantName: ct.tenant.fullName,
      tenantPhone: ct.tenant.phone,
      tenantIdCard: ct.tenant.idCardNumber,
      role: ct.role,
      joinedAt: ct.joinedAt,
      leftAt: ct.leftAt,
    })),
    chargeConfigs: c.chargeConfigs.map((cfg) => ({
      id: cfg.id,
      chargeType: cfg.chargeType,
      chargeMethod: cfg.chargeMethod,
      unitPrice: Number(cfg.unitPrice),
      effectiveFrom: cfg.effectiveFrom,
      effectiveTo: cfg.effectiveTo,
    })),
    roomOverrideChargeConfigs: c.room.chargeConfigs.map((cfg) => ({
      id: cfg.id,
      chargeType: cfg.chargeType,
      chargeMethod: cfg.chargeMethod,
      unitPrice: Number(cfg.unitPrice),
      effectiveFrom: cfg.effectiveFrom,
      effectiveTo: cfg.effectiveTo,
    })),
    buildingDefaultChargeConfigs: c.room.building.chargeConfigs.map((cfg) => ({
      id: cfg.id,
      chargeType: cfg.chargeType,
      chargeMethod: cfg.chargeMethod,
      unitPrice: Number(cfg.unitPrice),
      effectiveFrom: cfg.effectiveFrom,
      effectiveTo: cfg.effectiveTo,
    })),
  };
}

export async function findTenantOwnContract(tenantUserId: string): Promise<ContractDetailDTO | null> {
  const ct = await prisma.contractTenant.findFirst({
    where: {
      tenant: { userId: tenantUserId },
      leftAt: null,
      contract: { status: "ACTIVE", deletedAt: null },
    },
    select: { contractId: true },
  });

  if (!ct) return null;

  const c = await prisma.contract.findUnique({
    where: { id: ct.contractId },
    include: {
      room: {
        select: {
          buildingId: true,
          roomNumber: true,
          building: {
            select: {
              name: true,
              chargeConfigs: { where: { roomId: null, contractId: null } },
            },
          },
          chargeConfigs: { where: { contractId: null } },
        },
      },
      contractTenants: {
        where: { leftAt: null },
        include: {
          tenant: { select: { fullName: true, phone: true, idCardNumber: true } },
        },
      },
      chargeConfigs: true,
    },
  });

  if (!c) return null;

  const primary = c.contractTenants.find((item) => item.role === "PRIMARY") || c.contractTenants[0];

  return {
    id: c.id,
    roomId: c.roomId,
    buildingName: c.room.building.name,
    roomNumber: c.room.roomNumber,
    contractCode: c.contractCode,
    startDate: c.startDate,
    endDate: c.endDate,
    actualMoveInDate: c.actualMoveInDate,
    actualMoveOutDate: c.actualMoveOutDate,
    depositAmount: Number(c.depositAmount),
    monthlyPrice: Number(c.monthlyPrice),
    billingDay: c.billingDay,
    status: c.status,
    primaryTenantName: primary?.tenant.fullName || "Chưa gán",
    tenantsCount: c.contractTenants.length,
    cancellationReason: c.cancellationReason,
    terminationDate: c.terminationDate,
    terminationReason: c.terminationReason,
    depositReturnedAmount: Number(c.depositReturnedAmount),
    depositDeductionAmount: Number(c.depositDeductionAmount),
    documentPath: c.documentPath,
    notes: c.notes,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    tenants: c.contractTenants.map((item) => ({
      id: item.id,
      contractId: item.contractId,
      tenantId: item.tenantId,
      tenantName: item.tenant.fullName,
      tenantPhone: item.tenant.phone,
      tenantIdCard: item.tenant.idCardNumber,
      role: item.role,
      joinedAt: item.joinedAt,
      leftAt: item.leftAt,
    })),
    chargeConfigs: c.chargeConfigs.map((cfg) => ({
      id: cfg.id,
      chargeType: cfg.chargeType,
      chargeMethod: cfg.chargeMethod,
      unitPrice: Number(cfg.unitPrice),
      effectiveFrom: cfg.effectiveFrom,
      effectiveTo: cfg.effectiveTo,
    })),
    roomOverrideChargeConfigs: c.room.chargeConfigs.map((cfg) => ({
      id: cfg.id,
      chargeType: cfg.chargeType,
      chargeMethod: cfg.chargeMethod,
      unitPrice: Number(cfg.unitPrice),
      effectiveFrom: cfg.effectiveFrom,
      effectiveTo: cfg.effectiveTo,
    })),
    buildingDefaultChargeConfigs: c.room.building.chargeConfigs.map((cfg) => ({
      id: cfg.id,
      chargeType: cfg.chargeType,
      chargeMethod: cfg.chargeMethod,
      unitPrice: Number(cfg.unitPrice),
      effectiveFrom: cfg.effectiveFrom,
      effectiveTo: cfg.effectiveTo,
    })),
  };
}
