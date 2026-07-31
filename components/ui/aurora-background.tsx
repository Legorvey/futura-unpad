"use client";

import React from "react";

export { SectionDivider, AuroraDivider } from "./section-divider";

export function AuroraBackground({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
