import type { Metadata } from "next"
import { HeroSection } from "@/components/mechatura/hero-section";
import OurMemories from "@/components/mechatura/our-memories";
import { KategoriKompetisi } from "@/components/mechatura/kategori-kompetisi";
import { MechaturaTimeline } from "@/components/mechatura/mechatura-timeline";
import LocationSection from "@/components/mechatura/location-section";
import { MechaturaFAQ } from "@/components/mechatura/mechatura-faq";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Mechatura"
}

export default function Mechatura() {
    return (
        <main className="space-y-36">
            <HeroSection />
            <ScrollReveal>
                <OurMemories />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <KategoriKompetisi />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <MechaturaTimeline />
            </ScrollReveal>
            <hr className="border-border w-1/2 mx-auto" />
            <ScrollReveal>
                <LocationSection />
            </ScrollReveal>
            <ScrollReveal>
                <MechaturaFAQ />
            </ScrollReveal>
        </main>
    );
}