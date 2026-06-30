import type { Metadata } from "next"

import AboutSection from "@/components/landing/about-section"
import { FAQSection } from "@/components/landing/faq-section"
import { EventOverviewSection } from "@/components/landing/event-overview-section"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { RegistrationCards } from "@/components/landing/registration-cards"
import HowToRegisterSection from "@/components/landing/how-to-register"

export const metadata: Metadata = {
  title: "Coming Soon!",
  description:
    "Register for Futura 2026, a university technology event featuring seminars, robotic competition, and research dissemination.",
}

export default function Home() {
  return (
    <main className="bg-[#fbfbf8]">
      <HeroSection />
      <AboutSection />
      <HowToRegisterSection />
      <RegistrationCards />
      <EventOverviewSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
