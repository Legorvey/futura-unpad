import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ErrorStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  onAction?: () => void;
  actionLabel: string;
  className?: string;
}

export function ErrorState({
  icon: Icon,
  title,
  description,
  actionHref,
  onAction,
  actionLabel,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 text-center ${className}`}>
      {Icon && (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
          <Icon size={48} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
      )}
      <section className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-neutral-500">
          {description}
        </p>
      </section>
      
      {actionHref ? (
        <Button asChild className="mt-4 h-11 rounded-xl px-8">
          <Link href={actionHref} prefetch={false}>
            {actionLabel}
          </Link>
        </Button>
      ) : onAction ? (
        <Button onClick={onAction} className="mt-4 h-11 rounded-xl px-8">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
