import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SummaryItemProps {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export function SummaryItem({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: SummaryItemProps) {
  return (
    <div className={className}>
      <dt className={cn("text-muted-foreground text-sm", labelClassName)}>
        {label}
      </dt>
      <dd className={cn("mt-1 font-medium text-sm", valueClassName)}>
        {value || "-"}
      </dd>
    </div>
  );
}
