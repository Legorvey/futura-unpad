/* eslint-disable */
"use client";
import { useRef, useEffect, useState, type PointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

const textHoverSettings = {
  idleStroke: "#272727",
  hoverStroke: "#979797",
  hoverOpacity: 0.7,
  hoverRevealOpacity: 1,
  hitStrokeWidth: 10,
  cursorFollowDuration: 0.18,
  hoverFadeDuration: 0.35,
  drawDuration: 4,
  maskRadius: "20%",
};

const dividerGlowSettings = {
  baseLine: "rgba(255,255,255,0.16)",
  glowCore: "#ffffff",
  glowEdge: "rgba(255,255,255,0.18)",
  glowShadow: "drop-shadow(0 0 12px rgba(255,255,255,0.75))",
  glowWidth: "18%",
  hoverArea: "py-1",
  lineHeight: "1px",
  cursorSpring: { stiffness: 180, damping: 28, mass: 0.2 },
  fadeDuration: 0.35,
};

export function TextHoverEffect({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const updateCursor = (event: PointerEvent<SVGTextElement>) => {
    setCursor({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none uppercase", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          <stop offset="100%" stopColor={textHoverSettings.hoverStroke} />
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r={textHoverSettings.maskRadius}
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{
            duration: duration ?? textHoverSettings.cursorFollowDuration,
            ease: "easeOut",
          }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-200 text-7xl font-bold dark:stroke-neutral-800"
        style={{ pointerEvents: "none" }}
        animate={{ opacity: hovered ? textHoverSettings.hoverOpacity : 0 }}
        transition={{
          duration: textHoverSettings.hoverFadeDuration,
          ease: "easeOut",
        }}
      >
        {text}
      </motion.text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent text-7xl font-bold"
        stroke={textHoverSettings.idleStroke}
        style={{ pointerEvents: "none" }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: textHoverSettings.drawDuration,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent text-7xl font-bold"
        style={{ pointerEvents: "none" }}
        animate={{ opacity: hovered ? textHoverSettings.hoverRevealOpacity : 0 }}
        transition={{
          duration: textHoverSettings.hoverFadeDuration,
          ease: "easeOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="transparent"
        stroke="transparent"
        strokeWidth={textHoverSettings.hitStrokeWidth}
        className="text-8xl font-bold"
        pointerEvents="painted"
        onPointerEnter={(event) => {
          setHovered(true);
          updateCursor(event);
        }}
        onPointerMove={updateCursor}
        onPointerLeave={() => setHovered(false)}
      >
        {text}
      </text>
    </svg>
  );
}

function FooterGlowDivider({ className }: { className?: string }) {
  const [active, setActive] = useState(false);
  const cursorX = useMotionValue(50);
  const smoothCursorX = useSpring(cursorX, dividerGlowSettings.cursorSpring);
  const glowBackground = useMotionTemplate`radial-gradient(${dividerGlowSettings.glowWidth} 1200% at ${smoothCursorX}% 50%, ${dividerGlowSettings.glowCore} 0%, ${dividerGlowSettings.glowEdge} 45%, transparent 72%)`;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width) * 100;
    cursorX.set(Math.min(100, Math.max(0, nextX)));
  };

  return (
    <div
      className={cn(dividerGlowSettings.hoverArea, className)}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={handlePointerMove}
    >
      <div className="relative w-full">
        <div
          className="w-full"
          style={{
            height: dividerGlowSettings.lineHeight,
            backgroundColor: dividerGlowSettings.baseLine,
          }}
        />
        <motion.div
          className="absolute inset-x-0 top-0"
          style={{
            height: dividerGlowSettings.lineHeight,
            background: glowBackground,
            filter: dividerGlowSettings.glowShadow,
          }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{
            duration: dividerGlowSettings.fadeDuration,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute inset-x-0 top-0"
          style={{
            height: dividerGlowSettings.lineHeight,
            background: glowBackground,
          }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{
            duration: dividerGlowSettings.fadeDuration,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, #0A0A0A 45%, #0A0A0A 100%)",
      }}
    />
  );
};
