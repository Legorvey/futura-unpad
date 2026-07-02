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
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {timeBlocks.map((block, index) => (
        <div key={block.key} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/20 transition-transform duration-300 hover:scale-105">
              <span
                className="text-3xl sm:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight"
                suppressHydrationWarning
              >
                {String(timeLeft[block.key]).padStart(2, "0")}
              </span>
            </div>

            <span className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-500">
              {block.label}
            </span>
          </div>

          {index < timeBlocks.length - 1 && (
            <span className="text-2xl sm:text-4xl font-bold text-slate-300 -mt-6 sm:-mt-8 animate-countdown-pulse">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}