/* eslint-disable */
"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useLiteMotion } from "@/hooks/use-lite-motion"
import { ButtonV2 } from "../ui/button-v2"
import { cn } from "@/lib/utils"

const faqSettings = {
  defaultOpen: false,
  answerOffsetX: -10,
  answerBlur: "8px",
  motion: {
    dropdown: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
    answer: {
      duration: 0.3,
      delay: 0.05,
      ease: [0.16, 1, 0.3, 1],
    },
    icon: {
      duration: 0.3,
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
  headingPadding?: string
  faqs: FAQ[]
}

export const generalFaqs: FAQ[] = [
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
      "Ya, finalis yang mendapatkan juara akan mendapat undangan khusus untuk hadir di acara puncak di Unpad Dipatiukur, namun ketentuan ini juga menyesuaikan dengan kebersediaan juara. Kebersediaan untuk menghadiri undangan tidak akan mempengaruhi penilaian juara.",
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

export const esaiFaqs: FAQ[] = [
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

export const faqGroups: FAQGroup[] = [
  {
    title: "Pertanyaan Umum",
    faqs: generalFaqs,
  },
  {
    title: "Seminar Nasional",
    faqs: nationalSeminarFaqs,
  },
  {
    title: "Mechatura",
    faqs: mechaturaFaqs,
  },
  {
    title: "Lomba Esai",
    faqs: esaiFaqs,
  },
]

export function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState<boolean>(faqSettings.defaultOpen)
  const isLiteMotion = useLiteMotion()
  const answerOffsetX = isLiteMotion ? -4 : faqSettings.answerOffsetX
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] overflow-hidden group">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between p-5 md:p-6 text-left transition-colors duration-200 gap-4"
      >
        <span className="text-base sm:text-lg md:text-xl font-medium tracking-[-0.02em] text-white">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={iconMotion}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-300 transition-colors duration-300 group-hover:bg-amber-300/20"
        >
          <ChevronDown className="h-4 w-4" />
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
            <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0 border-t border-white/5">
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
                className="mt-3 text-sm sm:text-base md:text-lg leading-relaxed text-zinc-300 font-light tracking-[-0.02em]"
              >
                {faq.answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export type FAQSectionProps = {
  id?: string
  badge?: string
  title?: string
  subtitle?: string
  groups?: FAQGroup[]
  showAllButton?: boolean
  limitGroups?: boolean
  className?: string
}

export function FAQSection({
  id = "faq",
  title = "Frequently Asked Questions",
  subtitle = "Temukan jawaban untuk pertanyaan yang paling sering diajukan seputar rangkaian acara Futura 2026.",
  groups = faqGroups,
  showAllButton = true,
  limitGroups = false,
  className,
}: FAQSectionProps) {
  const displayGroups = limitGroups ? groups.slice(0, 1) : groups
  const isSingleGroup = displayGroups.length === 1

  return (
    <section
      id={id}
      className={cn(
        "mb-48 relative w-full px-6 md:px-12 lg:px-20 overflow-x-clip",
        className
      )}
    >
      {/* Centered Ambient Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 mx-auto max-w-[100rem] w-full flex flex-col items-center">
        
        {/* Middle-Oriented Header */}
        <div className="text-center mx-auto mb-12 md:mb-16 flex flex-col items-center">
          <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
              {subtitle}
            </p>
          )}
        </div>

        {/* Middle-Oriented FAQ Body */}
        <div className="w-full max-w-3xl md:max-w-4xl mx-auto space-y-12 md:space-y-16">
          {displayGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              {!isSingleGroup && (
                <div className="flex items-center gap-4 pt-4 pb-2">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <h3 className="text-lg md:text-xl font-semibold tracking-[-0.03em] text-amber-300 text-center uppercase">
                    {group.title}
                  </h3>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
              )}
              <div className="space-y-3.5 md:space-y-4">
                {group.faqs.map((faq) => (
                  <FAQItem key={faq.question} faq={faq} />
                ))}
              </div>
            </div>
          ))}

          {showAllButton && (
            <div className="flex justify-center pt-6 md:pt-8">
              <ButtonV2
                text="Lihat Semua FAQ"
                href="/faq"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
