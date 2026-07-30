import React from "react";

export interface DateDisplayProps {
  date: Date | string | null | undefined;
  formatStr?: "date" | "datetime";
  className?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  formatStr = "date",
  className = "",
}) => {
  if (!date) return <span className="text-slate-400">-</span>;

  const d = new Date(date);
  if (isNaN(d.getTime())) return <span className="text-slate-400">-</span>;

  const formatted =
    formatStr === "datetime"
      ? d.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

  return <span className={className}>{formatted}</span>;
};
