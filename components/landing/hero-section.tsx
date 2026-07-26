"use client"

import { useEffect, useState, useRef } from "react"
import { useInView } from "motion/react"
import { ButtonV3 } from "../ui/button-v3"

const SCRAMBLE_TARGET = "Future"
const SCRAMBLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]"
const SCRAMBLE_DELAY_MS = 3000
const SCRAMBLE_FRAME_MS = 48
const SCRAMBLE_FRAMES = 16

function getScrambledWord(frame: number) {
  return SCRAMBLE_TARGET.split("")
    .map((letter, index) => {
      if (frame > SCRAMBLE_FRAMES * (index + 1) / SCRAMBLE_TARGET.length) {
        return letter
      }

      return SCRAMBLE_CHARACTERS[
        Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)
      ]
    })
    .join("")
}

function ScrambledFuture() {
  const [word, setWord] = useState(SCRAMBLE_TARGET)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.5 })

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !isInView) {
      return
    }

    const startScramble = () => {
      let frame = 0

      const interval = window.setInterval(() => {
        frame += 1
        setWord(getScrambledWord(frame))

        if (frame >= SCRAMBLE_FRAMES) {
          window.clearInterval(interval)
          setWord(SCRAMBLE_TARGET)
        }
      }, SCRAMBLE_FRAME_MS)
    }

    const timeout = window.setTimeout(startScramble, SCRAMBLE_DELAY_MS)
    const repeat = window.setInterval(startScramble, SCRAMBLE_DELAY_MS * 2)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(repeat)
    }
  }, [isInView])

  return (

    <span ref={ref} aria-label={SCRAMBLE_TARGET} className="inline-block min-w-[6ch]">
      {word}
    </span>
  )
}

export function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-background">
      <div className="relative mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 z-10 flex flex-col justify-center min-h-screen py-20">
        
        {/* Typographic Hero Stack */}
        <div className="flex flex-col w-full relative">
          
          {/* Massive Typography */}
          <div className="uppercase text-center font-black leading-[0.85] w-full relative flex flex-col">
            {/* <div className="tracking-[-0.06em] text-[4.5rem] sm:text-[6rem] md:text-[rem] text-white/90 relative z-10">
              <ScrambledFuture />
            </div> */}
            <h1 className="text-white text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem] tracking-[-0.05em] relative z-10">
              POWER ON THE<ScrambledFuture />
            </h1>
            <div className="flex justify-center mt-8">
              <ButtonV3 text="Register Now" href="#registration" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
