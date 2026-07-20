import type { Metadata } from "next"
import { HeroSection } from "@/components/seminar/hero-section"
import { RuangLingkup } from "@/components/seminar/ruang-lingkup"
import { SeminarTimeline } from "@/components/seminar/seminar-timeline"
import { SeminarFAQ } from "@/components/seminar/seminar-faq"
import OurMemories from "@/components/seminar/our-memories"
import PembicaraSeminarPleno from "@/components/seminar/pembicara-seminar-pleno"
import PembicaraTalkshow from "@/components/seminar/pembicara-talk-show"
import LocationSection from "@/components/seminar/location-section"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: "Seminar Nasional"
}

export default function SeminarNasional() {
    return (
        <main className="space-y-36">
            <HeroSection />
            <ScrollReveal>
                <OurMemories />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <RuangLingkup />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <SeminarTimeline />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <PembicaraSeminarPleno />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <PembicaraTalkshow />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <LocationSection />
            </ScrollReveal>
            <ScrollReveal>
                <SeminarFAQ />
            </ScrollReveal>
        </main>
    )
}
