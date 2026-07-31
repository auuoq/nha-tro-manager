import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({ className, children, title, subtitle, action, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E8E5DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-150",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4.5 border-b border-[#F2EFE9] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-[#252724] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#73766F] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {title || action ? <div className="p-6">{children}</div> : children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-4 flex flex-col gap-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-[#252724] tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-[#73766F] leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0 flex items-center gap-3", className)} {...props} />;
}
