import * as React from "react";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

export interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number | string | null | undefined;
}

export function CurrencyDisplay({ amount, className, ...props }: CurrencyDisplayProps) {
  return (
    <span className={cn("font-medium tracking-tight", className)} {...props}>
      {formatCurrency(amount)}
    </span>
  );
}
