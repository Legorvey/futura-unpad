import type { Metadata } from "next"

import AboutSection from "@/components/landing/about-section"
import { FAQSection } from "@/components/landing/faq-section"
import { EventOverviewSection } from "@/components/landing/event-overview-section"
import { HeroSection } from "@/components/landing/hero-section"
import RegistrationsSection from "@/components/landing/registrations-section"
import { RegistrationTimeline } from "@/components/landing/registration-timeline"
import { ReasonToJoinSection } from "@/components/landing/reason-to-join-section"
import { WhoCanJoinSection } from "@/components/landing/who-can-join-section"
import { CountdownPrizeSection } from "@/components/landing/countdown-prize-section"
import OurLocation from "@/components/landing/our-location"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: "Beranda",
  description: "Daftar Futura 2026, acara teknologi universitas yang menghadirkan seminar, kompetisi robotika, dan diseminasi riset.",
}

export default function Home() {
  return (
    <main className="space-y-36">
      <HeroSection />
      <hr className="border-border w-1/2 mx-auto" />
      <ScrollReveal>
        <AboutSection />
      </ScrollReveal>
      <hr className="border-border w-1/2 mx-auto" />
      <ScrollReveal>
        <RegistrationTimeline />
      </ScrollReveal>
      <hr className="border-border w-1/2 mx-auto" />
      <ScrollReveal>
        <RegistrationsSection />
      </ScrollReveal>
      <hr className="border-border w-1/2 mx-auto" />
      <ScrollReveal>
        <OurLocation />
      </ScrollReveal>
      <hr className="border-border w-1/2 mx-auto" />
      <ScrollReveal>
        <FAQSection limitGroups={true} />
      </ScrollReveal>
    </main>
  )
}
