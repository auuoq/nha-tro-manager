import { cn } from "@/shared/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl skeleton-shimmer bg-[#F2EFE9]", className)}
      {...props}
    />
  );
}
