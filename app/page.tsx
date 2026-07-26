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
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: "Beranda",
  description: "Daftar Futura 2026, acara teknologi universitas yang menghadirkan seminar, kompetisi robotika, dan diseminasi riset.",
}

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background-color: #00205B !important;
        }
        .landing-wrapper section,
        .landing-wrapper .bg-background {
          background-color: transparent !important;
        }
        @keyframes aurora-ribbon-1 {
          0% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.15; }
          25% { transform: translateY(-5vh) rotate(3deg) skewY(-3deg) scaleY(1.2); opacity: 0.25; }
          50% { transform: translateY(2vh) rotate(-1deg) skewY(4deg) scaleY(0.9); opacity: 0.2; }
          75% { transform: translateY(-3vh) rotate(2deg) skewY(-2deg) scaleY(1.1); opacity: 0.3; }
          100% { transform: translateY(0) rotate(-2deg) skewY(2deg); opacity: 0.15; }
        }
        @keyframes aurora-ribbon-2 {
          0% { transform: translateY(2vh) rotate(3deg) skewY(-2deg); opacity: 0.12; }
          33% { transform: translateY(-3vh) rotate(-2deg) skewY(3deg) scaleY(1.3); opacity: 0.22; }
          66% { transform: translateY(4vh) rotate(1deg) skewY(-4deg) scaleY(0.8); opacity: 0.18; }
          100% { transform: translateY(2vh) rotate(3deg) skewY(-2deg); opacity: 0.12; }
        }
        @keyframes aurora-ribbon-3 {
          0% { transform: translateY(-3vh) rotate(-1deg) skewY(1deg) scaleY(0.9); opacity: 0.2; }
          30% { transform: translateY(3vh) rotate(2deg) skewY(-2deg) scaleY(1.2); opacity: 0.15; }
          70% { transform: translateY(-4vh) rotate(-2deg) skewY(3deg) scaleY(1); opacity: 0.25; }
          100% { transform: translateY(-3vh) rotate(-1deg) skewY(1deg) scaleY(0.9); opacity: 0.2; }
        }
        .animate-aurora-ribbon-1 { animation: aurora-ribbon-1 12s ease-in-out infinite; }
        .animate-aurora-ribbon-2 { animation: aurora-ribbon-2 16s ease-in-out infinite; }
        .animate-aurora-ribbon-3 { animation: aurora-ribbon-3 20s ease-in-out infinite; }
      `}} />
      
      {/* Realistic Aurora Ribbons Background */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#00205B]">
         <div className="absolute top-[20%] left-[-10vw] w-[120vw] h-[15vh] bg-[#307FE2] blur-[60px] rounded-[100%] animate-aurora-ribbon-1" />
         <div className="absolute top-[45%] right-[-10vw] w-[130vw] h-[12vh] bg-[#307FE2] blur-[50px] rounded-[100%] animate-aurora-ribbon-2" />
         <div className="absolute bottom-[25%] left-[-15vw] w-[140vw] h-[18vh] bg-[#307FE2] blur-[70px] rounded-[100%] animate-aurora-ribbon-3" />
      </div>

      {/* Global Parallax Graphic Elements */}
      <ParallaxBackgrounds />

      <div className="landing-wrapper">
        <main className="space-y-36 relative z-10">
          <div className="flex flex-col">
            <HeroSection />
            <AboutSection />
          </div>
          <ScrollReveal>
            <RegistrationTimeline />
          </ScrollReveal>
          <RegistrationsSection />
          <ScrollReveal>
            <OurLocation />
          </ScrollReveal>
          <ScrollReveal>
            <FAQSection limitGroups={true} />
          </ScrollReveal>
        </main>
      </div>
    </>
  )
}
