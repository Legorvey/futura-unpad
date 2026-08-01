/* eslint-disable */
"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useLiteMotion } from "@/hooks/use-lite-motion"
import { ButtonV2 } from "../ui/button-v2"

const faqSettings = {
  defaultOpen: false,
  answerOffsetX: -18,
  answerBlur: "10px",
  classes: {
    titleColumn: "lg:sticky lg:top-28 lg:self-start",
    item: "group py-2 transition-colors duration-500",
    trigger:
      "flex w-full cursor-pointer items-center justify-between text-left text-lg font-medium",
    iconWrap:
      "ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors duration-500",
    icon: "h-5 w-5 text-primary",
    answer: "mt-4 max-w-2xl text-base leading-7 text-neutral-400",
  },
  motion: {
    dropdown: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1],
    },
    answer: {
      duration: 0.42,
      delay: 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
    icon: {
      duration: 0.36,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const

export type FAQ = {
  question: string
  answer: string
}

export type FAQGroup = {
  title: string
  headingPadding: string
  faqs: FAQ[]
}

const generalFaqs = [
  {
    question: "Apakah acara ini cocok untuk pemula?",
    answer:
      "Ya, terutama seminar. Namun untuk kompetisi, lebih baik jika Anda sudah memiliki tim dan ide/konsep yang akan dilombakan.",
  },
  {
    question: "Bagaimana cara mendaftarnya?",
    answer:
      "Pilih program yang diinginkan, lengkapi formulir pendaftaran, dan ikuti petunjuk konfirmasi dari panitia.",
  },
  {
    question: "Apakah juara wajib datang ke Unpad untuk mendapatkan hadiah?",
    answer:
      "Ya, finalis yang mendapatkan juara akan mendapat undangan khusus untuk hadir di acara puncak di Unpad Dipatiukur, namun ketentuan ini juga menyesuaikan dengan kebersediaan juara. Kebersediaan untuk menghandiri undangan tidak akan mempengaruhi penilaian juara.",
  },
]

export const nationalSeminarFaqs: FAQ[] = [
  {
    question: "Apakah saya bisa berpartisipasi secara online (daring)?",
    answer:
      "Beberapa sesi seminar mungkin mendukung partisipasi daring. Untuk kompetisi, format pelaksanaannya mengacu pada petunjuk teknis (Juklak).",
  },
  {
    question: "Apakah peserta akan mendapatkan sertifikat?",
    answer:
      "Ya. Peserta yang memenuhi syarat dan menyelesaikan rangkaian acara akan menerima sertifikat resmi Futura.",
  },
]

export const mechaturaFaqs: FAQ[] = [
  {
    question: "Apakah robot harus dibuat sendiri?",
    answer:
      "Ya. Robot yang digunakan merupakan hasil perancangan dan pengembangan tim peserta sesuai dengan peraturan yang tercantum dalam Juklak masing-masing kategori.",
  },
  {
    question: "Di mana saya dapat melihat peraturan dan spesifikasi lomba?",
    answer:
      "Seluruh aturan, spesifikasi robot, sistem pertandingan, serta ketentuan teknis dapat diunduh melalui halaman Booklet dan Petunjuk Pelaksanaan (Juklak) pada website Mechatura 2026.",
  },
  {
    question: "Apakah peserta boleh memodifikasi robot setelah pendaftaran?",
    answer:
      "Boleh, selama modifikasi tetap memenuhi seluruh spesifikasi dan ketentuan yang telah ditetapkan dalam Juklak hingga proses technical meeting dan inspeksi robot.",
  },
  {
    question: "Apakah akan diadakan Technical Meeting?",
    answer:
      "Ya. Seluruh tim yang telah terdaftar diwajibkan mengikuti Technical Meeting untuk memperoleh penjelasan mengenai teknis perlombaan, jadwal, regulasi, serta sesi tanya jawab bersama panitia.",
  },
  {
    question: "Di mana saya dapat memperoleh informasi terbaru mengenai Mechatura 2026?",
    answer:
      "Informasi terbaru mengenai jadwal, pengumuman, perubahan regulasi, serta hasil perlombaan akan diumumkan melalui akun instagram resmi FUTURA 2026.",
  },
]


const esaiFaqs = [
  {
    question: "Apakah saya bisa berpartisipasi secara online (daring)?",
    answer:
      "Ya, Lomba Esai dapat diikuti secara daring. Pengumpulan naskah dilakukan secara online melalui website ini.",
  },
  {
    question: "Apakah peserta akan mendapatkan sertifikat?",
    answer:
      "Ya. Peserta yang mengumpulkan naskah sesuai syarat dan ketentuan akan mendapatkan e-sertifikat.",
  },
]

const faqGroups = [
  {
    title: "Pertanyaan Umum",
    headingPadding: "pb-6",
    faqs: generalFaqs,
  },
  {
    title: "Seminar Nasional",
    headingPadding: "pb-6",
    faqs: nationalSeminarFaqs,
  },
  {
    title: "Mechatura",
    headingPadding: "pb-6",
    faqs: mechaturaFaqs,
  },
  {
    title: "Lomba Esai",
    headingPadding: "pb-6",
    faqs: esaiFaqs,
  },
]

function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState<boolean>(faqSettings.defaultOpen)
  const isLiteMotion = useLiteMotion()
  const answerOffsetX = isLiteMotion ? -6 : faqSettings.answerOffsetX
  const answerBlur = isLiteMotion ? "0px" : faqSettings.answerBlur
  const dropdownMotion = isLiteMotion
    ? { duration: 0.2, ease: "easeOut" as const }
    : faqSettings.motion.dropdown
  const answerMotion = isLiteMotion
    ? { duration: 0.18, ease: "easeOut" as const }
    : faqSettings.motion.answer
  const iconMotion = isLiteMotion
    ? { duration: 0.18, ease: "easeOut" as const }
    : faqSettings.motion.icon

  return (
    <div className={faqSettings.classes.item}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={faqSettings.classes.trigger}
      >
        <span>{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={iconMotion}
          className={faqSettings.classes.iconWrap}
        >
          <ChevronDown className={faqSettings.classes.icon} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={dropdownMotion}
            className="overflow-hidden"
          >
            <motion.p
              initial={{
                x: answerOffsetX,
                opacity: 0,
                filter: `blur(${answerBlur})`,
              }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{
                x: answerOffsetX,
                opacity: 0,
                filter: `blur(${answerBlur})`,
              }}
              transition={answerMotion}
              className={faqSettings.classes.answer}
            >
              {faq.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type FAQSectionProps = {
  id?: string
  title?: string
  groups?: FAQGroup[]
  showAllButton?: boolean
  limitGroups?: boolean
}

export function FAQSection({
  id = "faq",
  title = "Frequently Asked Questions.",
  groups = faqGroups,
  showAllButton = true,
  limitGroups = false,
}: FAQSectionProps) {
  const displayGroups = limitGroups ? groups.slice(0, 1) : groups;
  return (
    <section
      id={id}
      className="mb-48 relative px-5 sm:px-8 overflow-x-clip"
    >
      <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[40%] h-[60%] bg-primary/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 mx-auto grid max-w-[82rem] lg:grid-cols-2">
        <div className={faqSettings.classes.titleColumn}>
          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
            {title}
          </h2>
        </div>

        <div className="space-y-12">
          {displayGroups.map((group) => (
            <div key={group.title + group.headingPadding}>
              <h3
                className={`border-b border-border/50 mb-3 text-2xl font-semibold ${group.headingPadding}`}
              >
                {group.title}
              </h3>
              <div className="space-y-4">
                {group.faqs.map((faq) => (
                  <FAQItem key={faq.question} faq={faq} />
                ))}
              </div>
            </div>
          ))}

          {showAllButton && (
            <div className="flex justify-center">
              <ButtonV2
                text="Lihat Semua"
                href="/faq"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
