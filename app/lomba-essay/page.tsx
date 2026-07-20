import type { Metadata } from "next"
import { HeroSection } from "@/components/essay/hero-section"

export const metadata: Metadata = {
  title: "Lomba Essay"
}

export default function LombaEssay() {
    return (
        <main>
            <HeroSection />
        </main>
    )
}