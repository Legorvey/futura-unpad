"use client";

import Link from "next/link";
import {
  LucideIcon,
  AlertCircle,
  ShieldAlert,
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type IconType =
  | "alert"
  | "shield"
  | "clock"
  | "cancel"
  | "failed"
  | "success"
  | "refresh";

const iconMap: Record<IconType, LucideIcon> = {
  alert: AlertCircle,
  shield: ShieldAlert,
  clock: Clock,
  cancel: XCircle,
  failed: AlertTriangle,
  success: CheckCircle2,
  refresh: RefreshCw,
};

export type PaymentAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
};

interface PaymentErrorStateProps {
  iconType?: IconType;
  icon?: LucideIcon;
  title: string;
  description: string;
  actions?: PaymentAction[];
  primaryAction?: PaymentAction;
  secondaryAction?: PaymentAction;
  // Backwards-compatible simple props
  href?: string;
  cta?: string;
  className?: string;
  badgeTone?: "destructive" | "warning" | "info" | "neutral";
}

export default function PaymentErrorState({
  iconType,
  icon,
  title,
  description,
  actions,
  primaryAction,
  secondaryAction,
  href,
  cta,
  className,
  badgeTone = "destructive",
}: PaymentErrorStateProps) {
  const Icon = (iconType && iconMap[iconType]) || icon || AlertCircle;

  // Consolidate actions
  const actionList: PaymentAction[] = actions ? [...actions] : [];
  
  if (primaryAction) {
    actionList.push({ ...primaryAction, variant: primaryAction.variant || "primary" });
  } else if (cta && href) {
    actionList.push({ label: cta, href, variant: "primary" });
  }

  if (secondaryAction) {
    actionList.push({ ...secondaryAction, variant: secondaryAction.variant || "outline" });
  }

  const toneClasses = {
    destructive: {
      badge: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    },
    warning: {
      badge: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    },
    info: {
      badge: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    },
    neutral: {
      badge: "bg-neutral-500/20 border-neutral-500/40 text-neutral-200",
    },
  }[badgeTone];

  return (
    <>
      {/* Static Aurora Ribbons Background */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
        <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] opacity-20 transform translate-y-0 rotate-[-2deg] skew-y-[2deg]" />
        <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] opacity-20 transform translate-y-[2vh] rotate-[3deg] skew-y-[-2deg]" />
        <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] opacity-20 transform translate-y-[-3vh] rotate-[-1deg] skew-y-[1deg]" />
      </div>

      <main
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 py-24 sm:px-8",
          className
        )}
      >
        <div
          role={badgeTone === "destructive" ? "alert" : "status"}
          className="relative w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in duration-300"
        >
          <div className="relative mx-auto flex items-center justify-center">
            <div
              className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-2xl border",
                toneClasses.badge
              )}
            >
              <Icon size={40} strokeWidth={1.75} aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.04em] text-white text-balance">
              {title}
            </h1>
            <p className="mx-auto max-w-md text-sm sm:text-base font-normal leading-relaxed text-blue-100/80">
              {description}
            </p>
          </div>

          {actionList.length > 0 && (
            <div className={cn(
              "pt-2 gap-3",
              actionList.length > 1 ? "grid sm:grid-cols-2" : "flex justify-center"
            )}>
              {actionList.map((action, index) => {
                const isPrimary = action.variant === "primary";
                const btnClasses = isPrimary
                  ? "h-11 w-full rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold transition-all"
                  : "h-11 w-full rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium transition-all";

                if (action.href) {
                  return (
                    <Button key={index} asChild className={btnClasses}>
                      <Link href={action.href} prefetch={false}>
                        {action.label}
                      </Link>
                    </Button>
                  );
                }

                return (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    className={btnClasses}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
