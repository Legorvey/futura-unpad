/* eslint-disable */
"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  date: string;
  content: React.ReactNode;
}

type TimelineProps = {
  data: TimelineEntry[];
  title?: string;
  description?: string;
};

const timelineCopy = {
  defaultTitle: "Grand Timeline Futura",
  description:
    "Timeline Futura secara keseluruhan. Mulai dari pendaftaran seluruh acara hingga akhir acara.",
} as const;

const timelineLayout = {
  section: "w-full font-sans bg-background relative overflow-hidden",
  header: "mx-auto max-w-[100rem] px-5 sm:px-8 relative z-20",
  items: "relative mx-auto max-w-[100rem] px-5 sm:px-8 pb-24 md:pb-32 mt-12 md:mt-20",
  row: "relative pl-12 md:pl-20 py-10 md:py-16 border-t border-white/10 group",
  markerCell: "absolute left-0 top-10 md:top-16 z-20 flex justify-center mt-1 md:mt-1.5",
  marker: "flex h-5 w-5 md:h-6 md:w-6 items-center justify-center bg-black border border-white/20 transition-colors duration-500",
  markerDot: "h-2 w-2 md:h-3 md:w-3 bg-white",
  line: "absolute left-7 sm:left-10 md:left-11 top-0 w-[1px] -translate-x-1/2 overflow-hidden h-full bg-white/10",
  activeLine: "absolute inset-x-0 top-0 w-[1px] bg-white",
} as const;

const timelineDotAnimation = {
  glowStartOffset: -0.015,
  glowDistance: 0.08,
  dimOuter: "rgb(23 23 23)",
  dimDot: "rgb(38 38 38)",
  dimBorder: "rgb(64 64 64)",
  glowOuter: "rgba(255, 255, 255, 0.1)",
  glowDot: "rgb(255, 255, 255)",
  glowBorder: "rgb(200, 200, 200)",
  glowShadow:
    "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.2)",
  dimShadow: "0 0 0 rgba(255, 255, 255, 0)",
  dimScale: 0.84,
  glowScale: 1,
} as const;

function TimelineMarker({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const rawActivationPoint = total <= 1 ? 0 : index / (total - 1);
  const activationPoint = Math.min(
    1 - timelineDotAnimation.glowDistance,
    Math.max(0, rawActivationPoint + timelineDotAnimation.glowStartOffset)
  );
  const activationEnd = Math.min(
    1,
    activationPoint + timelineDotAnimation.glowDistance
  );
  const dotProgress = useTransform(
    scrollYProgress,
    [activationPoint, activationEnd],
    [0, 1],
    { clamp: true }
  );
  const outerBackground = useTransform(
    dotProgress,
    [0, 1],
    [timelineDotAnimation.dimOuter, timelineDotAnimation.glowOuter]
  );
  const dotBackground = useTransform(
    dotProgress,
    [0, 1],
    [timelineDotAnimation.dimDot, timelineDotAnimation.glowDot]
  );
  const dotBorder = useTransform(
    dotProgress,
    [0, 1],
    [timelineDotAnimation.dimBorder, timelineDotAnimation.glowBorder]
  );
  const dotShadow = useTransform(
    dotProgress,
    [0, 1],
    [timelineDotAnimation.dimShadow, timelineDotAnimation.glowShadow]
  );
  const dotScale = useTransform(
    dotProgress,
    [0, 1],
    [timelineDotAnimation.dimScale, timelineDotAnimation.glowScale]
  );

  return (
    <motion.div
      className={timelineLayout.marker}
      style={{ backgroundColor: outerBackground }}
    >
      <motion.div
        className={timelineLayout.markerDot}
        style={{
          backgroundColor: dotBackground,
          borderColor: dotBorder,
          boxShadow: dotShadow,
          scale: dotScale,
        }}
      />
    </motion.div>
  );
}

export const Timeline = ({
  data,
  title = timelineCopy.defaultTitle,
  description = timelineCopy.description,
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const parallaxY1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [-50, 100]);

  return (
    <div className={timelineLayout.section} ref={containerRef}>
      {/* Structural Lines (Exactly matching Hero and About Section) */}
      <div className="absolute inset-0 pointer-events-none flex justify-center z-0">
          <div className="w-full max-w-[100rem] h-full relative">
              <div className="absolute left-5 sm:left-8 top-0 h-full w-[1px] bg-white/10" />
              <div className="absolute right-5 sm:right-8 top-0 h-full w-[1px] bg-white/10" />
          </div>
      </div>

      <div className={timelineLayout.header}>
        <h2 className="mb-4 text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white">
          {title}
        </h2>
        <p className="max-w-md text-sm text-neutral-400 uppercase tracking-widest font-bold md:text-base">
          {description}
        </p>
      </div>

      <div ref={ref} className={timelineLayout.items}>
        {data.map((item, index) => {
          return (
            <div key={`${item.title}-${item.date}`} className={timelineLayout.row}>
              <div className={timelineLayout.markerCell}>
                <TimelineMarker
                  index={index}
                  total={data.length}
                  scrollYProgress={scrollYProgress}
                />
              </div>
              <motion.div style={{ y: parallaxY1 }} className="w-full flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                <div className="md:w-[25%] flex-shrink-0">
                  <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-neutral-500 md:mt-1.5">
                    {item.date}
                  </h4>
                </div>
                <div className="md:w-[45%] flex-shrink-0">
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-[1.1] text-white md:text-4xl">
                    {item.title}
                  </h3>
                </div>
                <div className="md:w-[30%] flex-shrink-0">
                  {item.content}
                </div>
              </motion.div>
            </div>
          );
        })}

        <div
          style={{
            height: height + "px",
          }}
          className={timelineLayout.line}
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className={timelineLayout.activeLine}
          />
        </div>
      </div>
    </div>
  );
};
