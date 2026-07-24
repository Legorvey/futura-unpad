import type { Metadata } from "next"
import { HeroSection } from "@/components/mechatura/hero-section";
import OurMemories from "@/components/mechatura/our-memories";
import { KategoriKompetisi } from "@/components/mechatura/kategori-kompetisi";
import { MechaturaTimeline } from "@/components/mechatura/mechatura-timeline";
import LocationSection from "@/components/mechatura/location-section";
import { MechaturaFAQ } from "@/components/mechatura/mechatura-faq";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionDivider } from "@/components/ui/section-divider";

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
            <SectionDivider />
            <ScrollReveal>
                <KategoriKompetisi />
            </ScrollReveal>
            <SectionDivider />
            <ScrollReveal>
                <MechaturaTimeline />
            </ScrollReveal>
            <SectionDivider />
            <ScrollReveal>
                <LocationSection />
            </ScrollReveal>
            <ScrollReveal>
                <MechaturaFAQ />
            </ScrollReveal>
        </main>
    );
}