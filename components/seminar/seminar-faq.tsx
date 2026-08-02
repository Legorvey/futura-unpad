import {
  FAQSection,
  nationalSeminarFaqs,
  type FAQGroup,
} from "@/components/landing/faq-section";

const seminarFaqGroups: FAQGroup[] = [
  {
    title: "Seminar Nasional",
    faqs: nationalSeminarFaqs,
  },
];

export function SeminarFAQ() {
  return (
    <FAQSection
      id="seminar-faq"
      badge="FAQ"
      title="Pertanyaan Seputar Seminar"
      subtitle="Pertanyaan umum seputar pendaftaran, pembicara, materi, dan sertifikat Seminar Nasional Futura 2026."
      groups={seminarFaqGroups}
      showAllButton={false}
    />
  );
}
