/* eslint-disable */
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds";

type AuthPageSkeletonProps = {
  variant: "login" | "register";
};

const authSkeletonConfig = {
  login: {
    titleClassName: "w-[25rem] max-w-full",
    descriptionClassName: "w-44",
    fields: [
      { labelClassName: "w-32" },
      { labelClassName: "w-24", withInlineAction: true },
    ],
    showKeepSignedIn: true,
    footerClassName: "w-56",
  },
  register: {
    titleClassName: "w-[22rem] max-w-full",
    descriptionClassName: "w-40",
    fields: [
      { labelClassName: "w-20" },
      { labelClassName: "w-14" },
      { labelClassName: "w-20", withStrengthMeter: true },
      { labelClassName: "w-32" },
    ],
    showTerms: true,
    footerClassName: "w-48",
  },
} as const;

export default function AuthPageSkeleton({ variant }: AuthPageSkeletonProps) {
  const config = authSkeletonConfig[variant];

  return (
    <main className="dark text-foreground min-h-screen w-full relative flex flex-col items-center justify-center px-4 pt-24 pb-12 font-sans overflow-x-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
            body {
              background-color: #00205B !important;
            }
            .form-visibility-fix input {
                background-color: rgba(255, 255, 255, 0.1) !important;
                border-color: rgba(255, 255, 255, 0.3) !important;
                color: white !important;
            }
            .form-visibility-fix input::placeholder {
                color: rgba(255, 255, 255, 0.5) !important;
            }
            .form-visibility-fix label {
                color: white !important;
                font-weight: 500 !important;
            }
            .form-visibility-fix .text-muted-foreground {
                color: rgba(255, 255, 255, 0.75) !important;
            }
            .form-visibility-fix a {
                color: #93c5fd !important;
            }
            .form-visibility-fix a:hover {
                color: white !important;
            }
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            @keyframes aurora-ribbon-1 {
            0% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.15; }
            25% { transform: translateY(-5vh) rotate(3deg) skewY(-3deg) scaleY(1.2); opacity: 0.25; }
            50% { transform: translateY(2vh) rotate(-1deg) skewY(4deg) scaleY(0.9); opacity: 0.2; }
            75% { transform: translateY(-3vh) rotate(2deg) skewY(-2deg) scaleY(1.1); opacity: 0.3; }
            100% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.15; }
            }
            @keyframes aurora-ribbon-2 {
            0% { transform: translateY(2vh) rotate(3deg) skewY(-2deg); opacity: 0.12; }
            33% { transform: translateY(-3vh) rotate(-2deg) skewY(3deg) scaleY(1.3); opacity: 0.22; }
            66% { transform: translateY(4vh) rotate(1deg) skewY(-4deg) scaleY(0.8); opacity: 0.18; }
            100% { transform: translateY(2vh) rotate(3deg) skewY(-2deg); opacity: 0.12; }
            }
            @keyframes aurora-ribbon-3 {
            0% { transform: translateY(-3vh) rotate(-1deg) skewY(1deg) scaleY(0.9); opacity: 0.2; }
            30% { transform: translateY(3vh) rotate(2deg) skewY(-2deg) scaleY(1.2); opacity: 0.15; }
            70% { transform: translateY(-4vh) rotate(-2deg) skewY(3deg) scaleY(1); opacity: 0.25; }
            100% { transform: translateY(-3vh) rotate(-1deg) skewY(1deg) scaleY(0.9); opacity: 0.2; }
            }
            .animate-aurora-ribbon-1 { animation: aurora-ribbon-1 12s ease-in-out infinite; }
            .animate-aurora-ribbon-2 { animation: aurora-ribbon-2 16s ease-in-out infinite; }
            .animate-aurora-ribbon-3 { animation: aurora-ribbon-3 20s ease-in-out infinite; }
        `}} />

        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] animate-aurora-ribbon-1 opacity-50" />
            <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] animate-aurora-ribbon-2 opacity-50" />
            <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] animate-aurora-ribbon-3 opacity-50" />
        </div>

        <ParallaxBackgrounds isStatic className="absolute inset-0 z-[2] mix-blend-screen opacity-40" />

        <div className="relative z-10 w-full max-w-md space-y-10 form-visibility-fix">
          <span className="sr-only">Loading authentication form...</span>

          <section className="space-y-1">
            <Skeleton className={cn("h-10 sm:h-9 md:h-10 bg-white/20", config.titleClassName)} />
            <Skeleton className={cn("h-4 bg-white/20 mt-2", config.descriptionClassName)} />
          </section>

          <section>
            <div className="space-y-6">
              <div className="space-y-6">
                {config.fields.map((field, index) => {
                  const keyId = `field-skeleton-${index}`;
                  return (
                  <SkeletonAuthField
                    key={keyId}
                    labelClassName={field.labelClassName}
                    withInlineAction={"withInlineAction" in field && field.withInlineAction}
                    withStrengthMeter={"withStrengthMeter" in field && field.withStrengthMeter}
                  />
                  )
                })}
              </div>

              {"showKeepSignedIn" in config && config.showKeepSignedIn ? (
                <SkeletonCheckboxRow labelClassName="w-28" />
              ) : null}

              {"showTerms" in config && config.showTerms ? (
                <SkeletonCheckboxRow labelClassName="w-64 max-w-[calc(100%-2rem)]" alignTop />
              ) : null}

              <div className="space-y-2">
                <Skeleton className="h-11 w-full rounded-[8px] bg-white/20" />
                <div className="flex items-center gap-4 my-2">
                  <div className="h-px flex-1 bg-white/20"></div>
                  <Skeleton className="h-4 w-8 bg-white/20" />
                  <div className="h-px flex-1 bg-white/20"></div>
                </div>
                <Skeleton className="h-11 w-full rounded-[8px] bg-white/20" />
              </div>

              <div className="flex justify-center mt-6">
                <Skeleton className={cn("h-4 bg-white/20", config.footerClassName)} />
              </div>
            </div>
          </section>
        </div>
    </main>
  );
}

function SkeletonAuthField({
  labelClassName,
  withInlineAction = false,
  withStrengthMeter = false,
}: {
  labelClassName: string;
  withInlineAction?: boolean;
  withStrengthMeter?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className={cn("h-4 bg-white/20", labelClassName)} />
        {withInlineAction ? <Skeleton className="h-4 w-28 bg-white/20" /> : null}
      </div>
      <Skeleton className="h-11 w-full rounded-[8px] bg-white/20" />
      {withStrengthMeter ? (
        <div className="flex gap-1 pt-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-1 flex-1 rounded-full bg-white/20" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SkeletonCheckboxRow({
  labelClassName,
  alignTop = false,
}: {
  labelClassName: string;
  alignTop?: boolean;
}) {
  return (
    <div className={cn("flex gap-2", alignTop ? "items-start" : "items-center")}>
      <Skeleton className="h-4 w-4 shrink-0 rounded-[4px] bg-white/20" />
      <Skeleton className={cn("h-4 bg-white/20", labelClassName)} />
    </div>
  );
}
