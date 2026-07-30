"use client";

import React from "react";
import { TenantItemDTO } from "../types/tenant.types";
import { TenantTable } from "./tenant-table";

export interface TenantListSectionProps {
  tenants: TenantItemDTO[];
  onArchive: (tenantId: string) => void;
}

export const TenantListSection: React.FC<TenantListSectionProps> = ({ tenants, onArchive }) => {
  return <TenantTable tenants={tenants} onArchive={onArchive} />;
};
