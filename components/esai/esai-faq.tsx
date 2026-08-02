import {
  FAQSection,
  esaiFaqs,
  type FAQGroup,
} from "@/components/landing/faq-section";

const esaiFaqGroups: FAQGroup[] = [
  {
    title: "Lomba Esai",
    faqs: esaiFaqs,
  },
];

export function EsaiFAQ() {
  return (
    <FAQSection
      id="esai-faq"
      badge="FAQ"
      title="Pertanyaan Seputar Lomba Esai"
      subtitle="Pertanyaan yang sering diajukan seputar format karya, mekanisme seleksi, dan pengumpulan Lomba Esai Futura 2026."
      groups={esaiFaqGroups}
      showAllButton={false}
    />
  );
}
