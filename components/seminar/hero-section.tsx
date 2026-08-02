"use client"

import { useEffect, useState, useRef } from "react"
import { useInView } from "motion/react"
import { ButtonV3 } from "../ui/button-v3"
import FlipCountdown from "./flip-countdown"

const SCRAMBLE_TARGET = "SEMINAR"
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

function ScrambledSeminar() {
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
    <span ref={ref} aria-label={SCRAMBLE_TARGET} className="inline-block min-w-[7ch]">
      {word}
    </span>
  )
}

export function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-background">
      <div className="relative mx-auto max-w-[100rem] pt-34 w-full px-6 md:px-12 lg:px-20 z-10 flex flex-col justify-center min-h-screen py-20">
        
        {/* Typographic Hero Stack */}
        <div className="flex flex-col w-full relative">
          
          {/* Massive Typography */}
          <div className="uppercase text-center font-black w-full relative flex flex-col items-center">
            <h1 className="leading-[0.85] text-white text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] tracking-[-0.05em] relative z-10">
              <ScrambledSeminar /> NASIONAL
            </h1>
            <p className="mt-6 text-md md:text-xl font-light text-zinc-300 max-w-3xl text-balance">
              Transformasi Teknologi di Era Making Indonesia 4.0: Konvergensi Energi, Konektivitas, dan Industri Nasional Menuju 2030
            </p>
            <div className="flex flex-col items-center mt-8 gap-4">
              <span className="font-bold uppercase tracking-wide text-sm md:text-base">
                Countdown
              </span>
              <FlipCountdown targetDate={new Date("2026-09-21T00:00:00+07:00").getTime()} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
