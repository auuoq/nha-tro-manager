"use client";

import React from "react";
import { ContractItemDTO } from "../types/contract.types";
import { ContractTable } from "./contract-table";

export interface ContractListSectionProps {
  contracts: ContractItemDTO[];
}

export const ContractListSection: React.FC<ContractListSectionProps> = ({ contracts }) => {
  return <ContractTable contracts={contracts} />;
};
