/* eslint-disable */
"use client";

import { calculateTimeLeft, timeBlocks } from "@/lib/landing/helper";
import { useEffect, useState } from "react";

type CountdownProps = {
  targetDate: number;
};

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6">
      {timeBlocks.map((block) => (
        <div key={block.key} className="flex flex-col items-center">
          {/* Techy, minimalistic box */}
          <div className="relative flex h-18 w-18 lg:h-24 lg:w-24 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20">
            {/* Subtle glow effect on hover can be added by tweaking borders/bg */}
            <span
              className="text-4xl lg:text-5xl font-mono font-medium text-white tabular-nums tracking-tighter"
              suppressHydrationWarning
            >
              {String(timeLeft[block.key]).padStart(2, "0")}
            </span>
          </div>

          <span className="mt-3 sm:mt-4 text-[0.6rem] sm:text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}
