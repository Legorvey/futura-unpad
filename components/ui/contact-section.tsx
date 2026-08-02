import React from 'react';
import { cn } from '@/lib/utils';

export type ContactPerson = {
  name: string;
  phone: string;
  initial?: string;
};

export interface ContactSectionProps {
  contacts: ContactPerson[];
  badgeText?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ContactSection({
  contacts,
  badgeText = "Narahubung",
  title = "Butuh Info Lebih Lanjut?",
  description = "Ada pertanyaan lebih lanjut? Jangan ragu untuk menghubungi narahubung di bawah ini.",
  className,
}: ContactSectionProps) {
  return (
    <section
      className={cn(
        "relative w-full max-w-[100rem] mx-auto px-6 md:px-12 lg:px-20 mb-48 flex flex-col items-center overflow-x-clip",
        className
      )}
    >
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[40%] h-[60%] bg-yellow-500/10 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 w-full mx-auto flex flex-col items-center">
        {/* <h3 className="text-yellow-500 font-bold tracking-[-0.02em] text-sm uppercase mb-4 text-center">
          {badgeText}
        </h3> */}

        <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance">
          {title}
        </h2>

        <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance mb-12">
          {description}
        </p>

        <div className="w-full max-w-md space-y-4">
          {contacts.map((contact, index) => {
            const initial = contact.initial || contact.name.charAt(0).toUpperCase();
            return (
              <a
                key={index}
                href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/[0.08] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-2xl hover:bg-white/[0.12] hover:-translate-y-1 transition-all duration-300 group w-full"
              >
                <div className="w-14 h-14 shrink-0 rounded-full bg-yellow-500/20 text-yellow-500 font-bold flex items-center justify-center text-xl group-hover:bg-yellow-500/30 transition-colors">
                  {initial}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg tracking-[-0.02em]">
                    {contact.name}
                  </span>
                  <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors tracking-[-0.02em]">
                    +{contact.phone}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
