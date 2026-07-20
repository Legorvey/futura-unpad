import type { Metadata } from "next"
import { FAQSection } from "@/components/landing/faq-section"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: "FAQ"
}

export default function FAQPage() {
  return (
    <>
      <main className="pt-32 pb-20 min-h-screen">
        <ScrollReveal>
          <FAQSection showAllButton={false} />
        </ScrollReveal>
      </main>
    </>
  )
}
