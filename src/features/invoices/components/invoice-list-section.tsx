"use client";

import React from "react";
import { InvoiceItemDTOList } from "../types/invoice.types";
import { InvoiceTable } from "./invoice-table";

export interface InvoiceListSectionProps {
  invoices: InvoiceItemDTOList[];
}

export const InvoiceListSection: React.FC<InvoiceListSectionProps> = ({ invoices }) => {
  return <InvoiceTable invoices={invoices} />;
};
