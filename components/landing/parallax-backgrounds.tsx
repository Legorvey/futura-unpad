"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLiteMotion } from "@/hooks/use-lite-motion";

export function ParallaxBackgrounds({
  className,
  isStatic = false,
}: {
  className?: string;
  isStatic?: boolean;
}) {
  const isLiteMotion = useLiteMotion();
  const { scrollYProgress } = useScroll();

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 15,
    mass: 0.8,
  });

  // ---------------- FOREGROUND ----------------
  const yTriangle1 = useTransform(smoothScroll, [0, 1], ["20vh", "-120vh"]);
  const rotateTriangle1 = useTransform(smoothScroll, [0, 1], [0, -90]);

  const yTriangle3 = useTransform(smoothScroll, [0, 1], ["70vh", "-10vh"]);
  const rotateTriangle3 = useTransform(smoothScroll, [0, 1], [45, 180]);

  // ---------------- MIDGROUND ----------------
  const yTech1 = useTransform(smoothScroll, [0, 1], ["70vh", "60vh"]);

  const yTriangle4 = useTransform(smoothScroll, [0, 1], ["10vh", "50vh"]);
  const rotateTriangle4 = useTransform(smoothScroll, [0, 1], [-45, 45]);

  // ---------------- BACKGROUND ----------------
  const yTriangle2 = useTransform(smoothScroll, [0, 1], ["10vh", "30vh"]);
  const rotateTriangle2 = useTransform(smoothScroll, [0, 1], [45, 120]);

  const yTech2 = useTransform(smoothScroll, [0, 1], ["35vh", "25vh"]);

  const shouldAnimate = !isStatic && !isLiteMotion;

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      {/* ---------------- BACKGROUND LAYER ---------------- */}
      <motion.div
        style={shouldAnimate ? { y: yTriangle2, rotate: rotateTriangle2 } : undefined}
        className="absolute top-[10%] left-[55%] w-[45vw] max-w-[800px] min-w-[280px] aspect-square opacity-[0.03] mix-blend-screen"
      >
        <Image
          src="/Triangle-bg.png"
          alt=""
          fill
          sizes="(max-width: 768px) 280px, 800px"
          className="object-contain"
          priority
        />
      </motion.div>

      <motion.div
        style={shouldAnimate ? { y: yTech2 } : undefined}
        className="absolute top-[35%] -left-[15vw] w-[50vw] max-w-[700px] min-w-[280px] aspect-square opacity-[0.03] mix-blend-screen"
      >
        <Image
          src="/Tech-bg.png"
          alt=""
          fill
          sizes="(max-width: 768px) 280px, 700px"
          className="object-contain"
        />
      </motion.div>

      {/* ---------------- MIDGROUND LAYER ---------------- */}
      <motion.div
        style={shouldAnimate ? { y: yTech1 } : undefined}
        className="absolute top-[0%] right-[2vw] w-[30vw] max-w-[550px] min-w-[200px] aspect-square opacity-[0.06] mix-blend-screen"
      >
        <Image
          src="/Tech-bg.png"
          alt=""
          fill
          sizes="(max-width: 768px) 200px, 550px"
          className="object-contain drop-shadow-[0_0_20px_rgba(48,127,226,0.1)]"
        />
      </motion.div>

      <motion.div
        style={shouldAnimate ? { y: yTriangle4, rotate: rotateTriangle4 } : undefined}
        className="absolute top-[0%] right-[12vw] w-[22vw] max-w-[400px] min-w-[200px] aspect-square opacity-[0.05] mix-blend-screen hidden md:block"
      >
        <Image
          src="/Triangle-bg.png"
          alt=""
          fill
          sizes="(max-width: 768px) 200px, 400px"
          className="object-contain"
        />
      </motion.div>

      {/* ---------------- FOREGROUND LAYER ---------------- */}
      <motion.div
        style={shouldAnimate ? { y: yTriangle1, rotate: rotateTriangle1 } : undefined}
        className="absolute top-[0%] -left-[8vw] w-[35vw] max-w-[600px] min-w-[220px] aspect-square opacity-[0.10] mix-blend-screen"
      >
        <Image
          src="/Triangle-bg.png"
          alt=""
          fill
          sizes="(max-width: 768px) 220px, 600px"
          className="object-cover drop-shadow-[0_0_40px_rgba(48,127,226,0.2)]"
        />
      </motion.div>

      <motion.div
        style={shouldAnimate ? { y: yTriangle3, rotate: rotateTriangle3 } : undefined}
        className="absolute top-[0%] left-[25vw] w-[25vw] max-w-[450px] min-w-[200px] aspect-square opacity-[0.08] mix-blend-screen hidden md:block"
      >
        <Image
          src="/Triangle-bg.png"
          alt=""
          fill
          sizes="(max-width: 768px) 200px, 450px"
          className="object-contain drop-shadow-[0_0_40px_rgba(48,127,226,0.2)]"
        />
      </motion.div>
    </div>
  );
}
