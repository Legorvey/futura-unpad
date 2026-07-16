"use client"

import { useEffect, useState, useRef } from "react"
import { useInView } from "motion/react"
import { ButtonV2 } from "../ui/button-v2"
import { BackgroundBeams } from "../ui/background-beams"
import InfoPill from "../ui/information-pill"

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
    <section id="home" className="relative overflow-hidden bg-background">
      <div className="relative mx-auto min-h-[calc(108svh-0px)] content-center gap-16 px-5 py-8 sm:px-8 z-10">

        {/* BACKGROUND */}
        <BackgroundBeams className="-z-10" />

        {/* MAIN TITLE */}
        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <InfoPill
            title="Registrasi Mechatura telah dibuka"
            href="/mechatura/"
          />
          <h1 className="z-10 text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter leading-none text-balance uppercase">
            Power on the<ScrambledFuture />
          </h1>
          {/* <h1 className="-mt-6 text-5xl sm:text-6xl lg:text-8xl font-light tracking-tighter leading-none text-balance text-neutral-500 uppercase">
            Futura
          </h1> */}
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 text-balance">
            Implementasi Energi Cerdas di Era Industri 5.0: Optimalisasi Smart Grid dan Energi Baru Terbarukan
          </p>

          <ButtonV2
            text="Daftar Sekarang"
            href="#registrations"
          />
        </div>

        {/* VIDEO HERO */}
        <div>

        </div>
      </div>
    </section>
  )
}
