import type { Metadata } from "next"
import { HeroSection } from "@/components/mechatura/hero-section";
import AboutSection from "@/components/mechatura/about-section";
import { KategoriKompetisi } from "@/components/mechatura/kategori-kompetisi";
import { MechaturaTimeline } from "@/components/mechatura/mechatura-timeline";
import LocationSection from "@/components/mechatura/location-section";
import { MechaturaFAQ } from "@/components/mechatura/mechatura-faq";
import { ContactSection } from "@/components/registration/mechatura/contact-section";
import { MechaturaCTA } from "@/components/mechatura/cta-section";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ParallaxBackgrounds } from "@/components/landing/parallax-backgrounds"

export const metadata: Metadata = {
  title: "Mechatura"
}

export default function Mechatura() {
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
                        <KategoriKompetisi />
                    </ScrollReveal>
                    
                    <ScrollReveal>
                        <MechaturaTimeline />
                    </ScrollReveal>
                    
                    <ScrollReveal>
                        <LocationSection />
                    </ScrollReveal>
                    
                    <ScrollReveal>
                        <MechaturaCTA />
                    </ScrollReveal>

                    <ScrollReveal>
                        <MechaturaFAQ />
                    </ScrollReveal>
                    
                    <ScrollReveal>
                        <ContactSection />
                    </ScrollReveal>
                </main>
            </div>
        </>
    );
}