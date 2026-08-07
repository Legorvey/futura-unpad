import {
  FAQSection,
  mechaturaFaqs,
  type FAQGroup,
} from "@/components/landing/faq-section";

const mechaturaFaqGroups: FAQGroup[] = [
  {
    title: "Mechatura",
    faqs: mechaturaFaqs,
  },
];

export function MechaturaFAQ() {
  return (
    <FAQSection
      id="mechatura-faq"
      badge="FAQ"
      title="Pertanyaan Seputar Mechatura"
      subtitle="Pertanyaan yang sering diajukan mengenai perlombaan, regulasi teknis, dan robotika Mechatura 2026."
      groups={mechaturaFaqGroups}
      showAllButton={false}
    />
  );
}
