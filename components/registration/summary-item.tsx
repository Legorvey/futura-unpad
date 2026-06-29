import type { ReactNode } from "react";

type SummaryItemProps = {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
};

export default function SummaryItem({
  label,
  value,
  className,
  valueClassName = "mt-1 font-medium",
}: SummaryItemProps) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  );
}
