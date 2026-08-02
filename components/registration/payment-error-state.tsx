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
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds";

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
      badge: "bg-rose-500/10 border-rose-500/20 text-rose-300",
    },
    warning: {
      badge: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    },
    info: {
      badge: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    },
    neutral: {
      badge: "bg-white/[0.06] border-white/15 text-white/90",
    },
  }[badgeTone];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            footer {
              display: none !important;
            }
            body {
              background-color: #00205B !important;
            }
            @keyframes aurora-ribbon-1 {
              0% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.12; }
              25% { transform: translateY(-3vh) rotate(2deg) skewY(-2deg) scaleY(1.1); opacity: 0.18; }
              50% { transform: translateY(2vh) rotate(-1deg) skewY(3deg) scaleY(0.95); opacity: 0.14; }
              75% { transform: translateY(-2vh) rotate(1deg) skewY(-1deg) scaleY(1.05); opacity: 0.2; }
              100% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.12; }
            }
            @keyframes aurora-ribbon-2 {
              0% { transform: translateY(2vh) rotate(2deg) skewY(-2deg); opacity: 0.1; }
              33% { transform: translateY(-2vh) rotate(-1deg) skewY(2deg) scaleY(1.15); opacity: 0.16; }
              66% { transform: translateY(3vh) rotate(1deg) skewY(-2deg) scaleY(0.9); opacity: 0.12; }
              100% { transform: translateY(2vh) rotate(2deg) skewY(-2deg); opacity: 0.1; }
            }
            @keyframes aurora-ribbon-3 {
              0% { transform: translateY(-2vh) rotate(-1deg) skewY(1deg) scaleY(0.95); opacity: 0.12; }
              30% { transform: translateY(2vh) rotate(1deg) skewY(-1deg) scaleY(1.1); opacity: 0.1; }
              70% { transform: translateY(-3vh) rotate(-1deg) skewY(2deg) scaleY(1); opacity: 0.18; }
              100% { transform: translateY(-2vh) rotate(-1deg) skewY(1deg) scaleY(0.95); opacity: 0.12; }
            }
            .animate-aurora-ribbon-1 { animation: aurora-ribbon-1 14s ease-in-out infinite; }
            .animate-aurora-ribbon-2 { animation: aurora-ribbon-2 18s ease-in-out infinite; }
            .animate-aurora-ribbon-3 { animation: aurora-ribbon-3 22s ease-in-out infinite; }
          `,
        }}
      />

      {/* Clean Aurora Ribbons Background */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
        <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[80px] rounded-[100%] animate-aurora-ribbon-1" />
        <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[70px] rounded-[100%] animate-aurora-ribbon-2" />
        <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[90px] rounded-[100%] animate-aurora-ribbon-3" />
      </div>

      {/* Reduced Static Background Graphic Elements (Zero Glows) */}
      <ParallaxBackgrounds isStatic />

      <main
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6",
          className
        )}
      >
        <div
          role={badgeTone === "destructive" ? "alert" : "status"}
          className="relative w-full max-w-lg mx-auto text-center space-y-5 animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border transition-colors",
                toneClasses.badge
              )}
            >
              <Icon size={30} strokeWidth={2} aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white text-balance font-sans leading-tight">
              {title}
            </h1>
            <p className="mx-auto max-w-md text-sm sm:text-base font-normal leading-relaxed text-blue-100/75">
              {description}
            </p>
          </div>

          {actionList.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {actionList.map((action, index) => {
                const isPrimary = action.variant === "primary";
                const btnClasses = isPrimary
                  ? "h-11 min-w-[150px] rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold px-6 text-sm sm:text-base transition-all shadow-sm"
                  : "h-11 min-w-[150px] rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium px-6 text-sm sm:text-base transition-all";

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
