import React from "react";
import Decimal from "decimal.js";

export interface CurrencyDisplayProps {
  amount: number | string | Decimal;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, className = "" }) => {
  const numericValue = typeof amount === "object" ? amount.toNumber() : Number(amount);
  
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericValue || 0);

  return <span className={`font-mono font-medium ${className}`}>{formatted}</span>;
};
