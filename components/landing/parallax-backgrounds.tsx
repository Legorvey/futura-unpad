"use client"

import { motion, useScroll, useTransform, useSpring } from "motion/react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function ParallaxBackgrounds({ className, isStatic = false }: { className?: string, isStatic?: boolean }) {
  const { scrollYProgress } = useScroll() 

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 30, 
    damping: 15,   
    mass: 0.8,     
  })

  // ---------------- FOREGROUND ----------------
  const yTriangle1 = useTransform(smoothScroll, [0, 1], ["20vh", "-120vh"])
  const rotateTriangle1 = useTransform(smoothScroll, [0, 1], [0, -90])

  const yTriangle3 = useTransform(smoothScroll, [0, 1], ["70vh", "-10vh"])
  const rotateTriangle3 = useTransform(smoothScroll, [0, 1], [45, 180])

  // ---------------- MIDGROUND ----------------
  const yTech1 = useTransform(smoothScroll, [0, 1], ["70vh", "60vh"])

  const yTriangle4 = useTransform(smoothScroll, [0, 1], ["10vh", "50vh"])
  const rotateTriangle4 = useTransform(smoothScroll, [0, 1], [-45, 45])

  // ---------------- BACKGROUND ----------------
  const yTriangle2 = useTransform(smoothScroll, [0, 1], ["10vh", "30vh"])
  const rotateTriangle2 = useTransform(smoothScroll, [0, 1], [45, 120])
  
  const yTech2 = useTransform(smoothScroll, [0, 1], ["35vh", "25vh"])

  if (isStatic) {
    return (
      <div className={cn("fixed inset-0 pointer-events-none z-[-1] overflow-hidden", className)}>
        {/* ---------------- BACKGROUND LAYER ---------------- */}
        <div className="absolute top-[10%] left-[55%] w-[45vw] max-w-[800px] min-w-[400px] aspect-square opacity-[0.03] mix-blend-screen translate-y-[10vh] rotate-[45deg]">
          <Image src="/Triangle-bg.png" alt="" fill className="object-contain" />
        </div>
        
        <div className="absolute top-[35%] left-[-15vw] w-[50vw] max-w-[700px] min-w-[350px] aspect-square opacity-[0.03] mix-blend-screen translate-y-[35vh]">
          <Image src="/Tech-bg.png" alt="" fill className="object-contain" />
        </div>

        {/* ---------------- MIDGROUND LAYER ---------------- */}
        <div className="absolute top-[0%] right-[2vw] w-[30vw] max-w-[550px] min-w-[300px] aspect-square opacity-[0.06] mix-blend-screen translate-y-[70vh]">
          <Image src="/Tech-bg.png" alt="" fill className="object-contain drop-shadow-[0_0_20px_rgba(48,127,226,0.1)]" />
        </div>

        <div className="absolute top-[0%] right-[12vw] w-[22vw] max-w-[400px] min-w-[200px] aspect-square opacity-[0.05] mix-blend-screen translate-y-[10vh] -rotate-45">
          <Image src="/Triangle-bg.png" alt="" fill className="object-contain" />
        </div>

        {/* ---------------- FOREGROUND LAYER ---------------- */}
        <div className="absolute top-[0%] left-[-8vw] w-[35vw] max-w-[600px] min-w-[350px] aspect-square opacity-[0.10] mix-blend-screen translate-y-[20vh]">
          <Image src="/Triangle-bg.png" alt="" fill className="object-contain drop-shadow-[0_0_40px_rgba(48,127,226,0.2)]" />
        </div>

        <div className="absolute top-[0%] left-[25vw] w-[25vw] max-w-[450px] min-w-[250px] aspect-square opacity-[0.08] mix-blend-screen translate-y-[70vh] rotate-45">
          <Image src="/Triangle-bg.png" alt="" fill className="object-contain drop-shadow-[0_0_40px_rgba(48,127,226,0.2)]" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-[-1] overflow-hidden", className)}>
      
      {/* ---------------- BACKGROUND LAYER ---------------- */}
      <motion.div 
        style={{ y: yTriangle2, rotate: rotateTriangle2 }}
        className="absolute top-[10%] left-[55%] w-[45vw] max-w-[800px] min-w-[400px] aspect-square opacity-[0.03] mix-blend-screen"
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain" />
      </motion.div>
      
      <motion.div 
        style={{ y: yTech2 }}
        className="absolute top-[35%] left-[-15vw] w-[50vw] max-w-[700px] min-w-[350px] aspect-square opacity-[0.03] mix-blend-screen"
      >
        <Image src="/Tech-bg.png" alt="" fill className="object-contain" />
      </motion.div>

      {/* ---------------- MIDGROUND LAYER ---------------- */}
      <motion.div 
        style={{ y: yTech1 }}
        className="absolute top-[0%] right-[2vw] w-[30vw] max-w-[550px] min-w-[300px] aspect-square opacity-[0.06] mix-blend-screen"
      >
        <Image src="/Tech-bg.png" alt="" fill className="object-contain drop-shadow-[0_0_20px_rgba(48,127,226,0.1)]" />
      </motion.div>

      <motion.div 
        style={{ y: yTriangle4, rotate: rotateTriangle4 }}
        className="absolute top-[0%] right-[12vw] w-[22vw] max-w-[400px] min-w-[200px] aspect-square opacity-[0.05] mix-blend-screen"
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain" />
      </motion.div>

      {/* ---------------- FOREGROUND LAYER ---------------- */}
      <motion.div 
        style={{ y: yTriangle1, rotate: rotateTriangle1 }}
        className="absolute top-[0%] left-[-8vw] w-[35vw] max-w-[600px] min-w-[350px] aspect-square opacity-[0.10] mix-blend-screen"
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain drop-shadow-[0_0_40px_rgba(48,127,226,0.2)]" />
      </motion.div>

      <motion.div 
        style={{ y: yTriangle3, rotate: rotateTriangle3 }}
        className="absolute top-[0%] left-[25vw] w-[25vw] max-w-[450px] min-w-[250px] aspect-square opacity-[0.08] mix-blend-screen"
      >
        <Image src="/Triangle-bg.png" alt="" fill className="object-contain drop-shadow-[0_0_40px_rgba(48,127,226,0.2)]" />
      </motion.div>

    </div>
  )
}
