"use client";

import React from "react";

export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full flex items-center justify-center my-12 ${className}`} aria-hidden="true">
      {/* Background Soft Glow */}
      <div className="absolute w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-sm" />
      {/* Center Gradient Line */}
      <div className="w-1/3 sm:w-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 dark:via-cyan-400/60 to-transparent" />
      {/* Glowing Diamond Center Node */}
      <div className="absolute w-1.5 h-1.5 rotate-45 bg-cyan-400 dark:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
    </div>
  );
}

// Alias for backwards compatibility
export const AuroraDivider = SectionDivider;
