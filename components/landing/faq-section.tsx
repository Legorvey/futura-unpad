import { ChevronDown } from "lucide-react"

const generalFaqs = [
  {
    question: "Is this beginner-friendly?",
    answer:
      "Yes, especially the seminar. The competition and research tracks are better if you already have a team, project, or question to bring.",
  },
  {
    question: "How do I register?",
    answer:
      "Choose a program, complete the form, and follow the confirmation steps from the committee.",
  },
]

const competitionFaqs = [
  {
    question: "Can I participate online?",
    answer:
      "Selected seminar sessions may support online participation. Competition and research formats depend on the technical guide.",
  },
  {
    question: "Will participants receive certificates?",
    answer:
      "Yes. Eligible participants who complete the event requirements will receive an official Futura certificate.",
  },
]

export function FAQSection() {
  return (
    <section
      id="faq"
      className="bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8 relative overflow-hidden"
    >
      <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[40%] h-[60%] bg-primary/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-4xl z-10">
        <div className="text-center">
          <h2 className="tracking-tighter mt-6 text-5xl leading-[1.1] text-balance sm:text-6xl">
            A few useful answers.
          </h2>
        </div>

        <div className="mt-16 space-y-12">
          {/* General Questions */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-slate-900 border-b border-border/50 pb-4">General Questions</h3>
            <div className="space-y-4">
              {generalFaqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30" open>
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-slate-900 list-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform group-open:rotate-180">
                      <ChevronDown className="h-5 w-5 text-primary" />
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 animate-in slide-in-from-top-2 fade-in duration-300">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Competition Details */}
          <div id="faq-competition" className="scroll-mt-24">
            <h3 className="text-2xl font-semibold mb-6 text-slate-900 border-b border-border/50 pb-4">Competition & Event Details</h3>
            <div className="space-y-4">
              {competitionFaqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30">
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-slate-900 list-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform group-open:rotate-180">
                      <ChevronDown className="h-5 w-5 text-primary" />
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 animate-in slide-in-from-top-2 fade-in duration-300">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
