import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Hiện chưa có thông tin nào được hiển thị tại đây.",
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-[#E8E5DF] shadow-2xs", className)}>
      <div className="w-12 h-12 rounded-2xl bg-[#F2EFE9] flex items-center justify-center text-[#73766F] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#252724]">{title}</h3>
      <p className="text-xs text-[#73766F] max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
