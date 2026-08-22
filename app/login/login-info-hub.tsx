import Countdown from "@/components/countdown";
import { Megaphone, CalendarClock, LifeBuoy, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LoginInfoHub() {
  // Target date for countdown: 1 Oct 2026
  const targetDate = new Date("2026-10-01T00:00:00+07:00").getTime();

  return (
    <div className="w-full h-full bg-[#00205B] text-white p-8 flex flex-col justify-between absolute inset-0">
      
      {/* Background Subtle Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full space-y-10">
        
        {/* Top: Event Countdown */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <CalendarClock className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Penutupan Pendaftaran</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <Countdown targetDate={targetDate} />
          </div>
        </section>

        {/* Middle: Latest Announcements */}
        <section className="space-y-5 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Megaphone className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Informasi Terbaru</h2>
          </div>
          
          <div className="space-y-3">
            {[
              {
                title: "Panduan Pendaftaran Peserta Dirilis",
                date: "22 Agustus 2026",
                tag: "Penting",
                tagColor: "bg-red-500/20 text-red-300 border-red-500/30",
              },
              {
                title: "Pendaftaran Gelombang 1 Resmi Dibuka",
                date: "20 Agustus 2026",
                tag: "Info",
                tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
              },
              {
                title: "Jadwal Technical Meeting Seminar Nasional",
                date: "15 Agustus 2026",
                tag: "Jadwal",
                tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
              }
            ].map((news, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${news.tagColor}`}>
                    {news.tag}
                  </span>
                  <span className="text-[11px] text-zinc-400">{news.date}</span>
                </div>
                <h3 className="text-sm font-medium text-white/90 group-hover:text-white leading-snug">
                  {news.title}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom: Social & Support */}
        <section className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <p className="text-xs text-zinc-400">Butuh bantuan pendaftaran?</p>
          <div className="flex items-center gap-3">
            <Link 
              href="https://instagram.com/futura.unpad" 
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>@futura.unpad</span>
            </Link>
            <Link 
              href="#" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-900/20"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Pusat Bantuan</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
