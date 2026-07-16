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
  section: "w-full font-sans bg-background md:px-10",
  header: "mx-auto max-w-[82rem] px-4 md:px-0",
  items: "relative mx-auto max-w-[82rem] pb-24 md:pb-20 md:mt-12",
  row: "relative grid grid-cols-[4rem_minmax(0,1fr)] pt-14 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:gap-x-8 md:pt-32",
  markerCell: "relative z-20 flex justify-center",
  marker: "flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-black",
  markerDot:
    "h-6 w-6 rounded-full border border-neutral-300 bg-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800",
  card: "max-w-xl",
  leftCard: "md:justify-self-end md:text-right",
  rightCard: "md:pl-4 md:justify-self-start md:text-left",
  mobileCard: "min-w-0 pr-4",
  line: "absolute left-8 top-0 w-[2px] -translate-x-1/2 overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)] dark:via-neutral-700 md:left-1/2 md:[mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]",
  activeLine:
    "absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-blue-600 via-blue-500 to-transparent from-[0%] via-[10%]",
} as const;

const timelineDotAnimation = {
  glowStartOffset: -0.015,
  glowDistance: 0.08,
  dimOuter: "rgb(23 23 23)",
  dimDot: "rgb(38 38 38)",
  dimBorder: "rgb(64 64 64)",
  glowOuter: "rgba(85, 126, 247, 0.18)",
  glowDot: "rgb(79, 147, 255)",
  glowBorder: "rgb(138, 197, 255)",
  glowShadow:
    "0 0 30px rgba(104, 172, 255, 0.72), 0 0 70px rgba(59, 130, 246, 0.4)",
  dimShadow: "0 0 0 rgba(168, 85, 247, 0)",
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

  return (
    <div className={timelineLayout.section} ref={containerRef}>
      <div className={timelineLayout.header}>
        <h2 className="mb-4 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight md:text-center">
          {title}
        </h2>
        <p className="max-w-md text-sm text-neutral-700 dark:text-neutral-300 md:text-base md:text-center md:mx-auto">
          {description}
        </p>
      </div>

      <div ref={ref} className={timelineLayout.items}>
        {data.map((item, index) => {
          const isLeft = index % 2 === 0;
          const card = (
            <div
              className={`${timelineLayout.card} ${timelineLayout.mobileCard} ${isLeft ? timelineLayout.leftCard : timelineLayout.rightCard
                }`}
            >
              <h3 className="text-lg font-bold leading-tight text-black dark:text-white md:text-2xl lg:text-3xl">
                {item.title}
              </h3>
              <h4 className="mb-4 mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400 md:text-lg lg:text-xl">
                {item.date}
              </h4>
            </div>
          );

          return (
            <div key={`${item.title}-${item.date}`} className={timelineLayout.row}>
              <div className="hidden md:block">{isLeft ? card : null}</div>
              <div className={timelineLayout.markerCell}>
                <TimelineMarker
                  index={index}
                  total={data.length}
                  scrollYProgress={scrollYProgress}
                />
              </div>
              <div className="md:hidden">{card}</div>
              <div className="hidden md:block">{isLeft ? null : card}</div>
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
