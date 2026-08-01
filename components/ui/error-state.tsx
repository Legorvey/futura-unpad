import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds";

export interface ErrorStateProps {
  statusCode?: string | number;
  icon?: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  onAction?: () => void;
  actionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  className?: string;
  tone?: "neutral" | "destructive" | "warning" | "info" | "success";
  withBackground?: boolean;
}

export function ErrorState({
  statusCode,
  icon: Icon = AlertCircle,
  title,
  description,
  actionHref,
  onAction,
  actionLabel,
  secondaryActionHref,
  onSecondaryAction,
  secondaryActionLabel,
  className = "",
  tone = "neutral",
  withBackground = true,
}: ErrorStateProps) {
  const toneClasses = {
    destructive: "bg-rose-500/10 border-rose-500/20 text-rose-300",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    neutral: "bg-white/[0.06] border-white/15 text-white/90",
  }[tone];

  const hasPrimaryAction = Boolean(actionLabel && (actionHref || onAction));
  const hasSecondaryAction = Boolean(
    secondaryActionLabel && (secondaryActionHref || onSecondaryAction)
  );

  return (
    <>
      {withBackground && (
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
        </>
      )}

      <div
        role={tone === "destructive" ? "alert" : "status"}
        className={cn(
          "relative w-full max-w-lg mx-auto text-center space-y-5 animate-in fade-in duration-300",
          className
        )}
      >
        {statusCode ? (
          <div className="text-6xl sm:text-7xl font-bold tracking-tight text-white/25 select-none pointer-events-none font-sans">
            {statusCode}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border transition-colors",
                toneClasses
              )}
            >
              <Icon size={30} strokeWidth={2} aria-hidden="true" />
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white text-balance font-sans leading-tight">
            {title}
          </h1>
          <p className="mx-auto max-w-md text-sm sm:text-base font-normal leading-relaxed text-blue-100/75">
            {description}
          </p>
        </div>

        {(hasPrimaryAction || hasSecondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {hasPrimaryAction &&
              (actionHref ? (
                <Button
                  asChild
                  className="h-11 min-w-[150px] rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold px-6 text-sm sm:text-base transition-all shadow-sm"
                >
                  <Link href={actionHref} prefetch={false}>
                    {actionLabel}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={onAction}
                  className="h-11 min-w-[150px] rounded-xl bg-white hover:bg-white/90 text-neutral-950 font-semibold px-6 text-sm sm:text-base transition-all shadow-sm"
                >
                  {actionLabel}
                </Button>
              ))}

            {hasSecondaryAction &&
              (secondaryActionHref ? (
                <Button
                  asChild
                  className="h-11 min-w-[150px] rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium px-6 text-sm sm:text-base transition-all"
                >
                  <Link href={secondaryActionHref} prefetch={false}>
                    {secondaryActionLabel}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={onSecondaryAction}
                  className="h-11 min-w-[150px] rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium px-6 text-sm sm:text-base transition-all"
                >
                  {secondaryActionLabel}
                </Button>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
