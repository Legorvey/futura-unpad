import React from 'react';

type ContactPerson = {
  name: string;
  phone: string;
  initial: string;
};

const contacts: ContactPerson[] = [
  {
    name: "Farras",
    phone: "6285654781073",
    initial: "F"
  },
  {
    name: "Lana",
    phone: "6282127271389",
    initial: "L"
  }
];

export function ContactSection() {
  return (
    <section className="relative px-5 sm:px-8 mb-48 flex flex-col items-center overflow-x-clip">
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[40%] h-[60%] bg-yellow-500/10 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
        <h3 className="text-yellow-500 font-bold tracking-widest text-sm uppercase mb-4 text-center">
          Narahubung
        </h3>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white">
          Butuh Info Lebih Lanjut?
        </h2>
        
        <p className="text-neutral-400 text-center mb-12 max-w-lg mx-auto text-lg">
          Ada pertanyaan lebih lanjut? Jangan ragu untuk menghubungi narahubung di bawah ini.
        </p>

        <div className="w-full max-w-md space-y-4">
          {contacts.map((contact, index) => (
            <a
              key={index}
              href={`https://wa.me/${contact.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/[0.08] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-2xl hover:bg-white/[0.12] hover:-translate-y-1 transition-all duration-300 group w-full"
            >
              <div className="w-14 h-14 shrink-0 rounded-full bg-yellow-500/20 text-yellow-500 font-bold flex items-center justify-center text-xl group-hover:bg-yellow-500/30 transition-colors">
                {contact.initial}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-lg">
                  {contact.name}
                </span>
                <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  +{contact.phone}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
