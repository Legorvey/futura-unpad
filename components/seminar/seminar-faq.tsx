import {
  FAQSection,
  nationalSeminarFaqs,
  type FAQGroup,
} from "@/components/landing/faq-section";

const seminarFaqGroups: FAQGroup[] = [
  {
    title: "Seminar Nasional",
    headingPadding: "pb-6",
    faqs: nationalSeminarFaqs,
  },
];

export function SeminarFAQ() {
  return (
    <FAQSection
      id="seminar-faq"
      title="FAQ Seminar Nasional"
      groups={seminarFaqGroups}
      showAllButton={false}
    />
  );
}
