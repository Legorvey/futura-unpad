"use client";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useState, useRef } from "react";

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.92-5.26 2.97-6.9 1.53-1.22 3.51-1.84 5.48-1.69l.04 4.31c-1.68-.07-3.3.7-4.14 2.14-.64 1.1-.64 2.5.01 3.58.74 1.25 2.21 1.95 3.65 1.8 1.51-.15 2.77-1.32 3.04-2.8.1-1.1.06-2.22.06-3.33V.02z" />
  </svg>
);

function AnimatedSocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCentered, setIsCentered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const threshold = rect.width * 0.35;
    setIsCentered(dist < threshold);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const threshold = rect.width * 0.35;
      setIsCentered(dist < threshold);
    }
    setIsHovered(true);
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      whileTap={{ scale: 0.95 }}
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setIsHovered(false); setIsCentered(false); }}
      className="group relative inline-flex overflow-hidden rounded-full p-3 bg-white transition-colors duration-200"
    >
      <motion.div
        initial={false}
        animate={{
          x: mousePos.x - 20,
          y: mousePos.y - 20,
          scale: isCentered ? 10 : (isHovered ? 1 : 0),
        }}
        transition={{
          scale: { duration: 0.45, ease: "easeInOut" },
          x: { type: "spring", stiffness: 200, damping: 25 },
          y: { type: "spring", stiffness: 200, damping: 25 }
        }}
        className="pointer-events-none absolute left-0 top-0 z-0 h-10 w-10 rounded-full bg-amber-300"
      />
      <span className="relative z-10 transition-colors duration-500 text-black">
        {icon}
      </span>
    </motion.a>
  );
}

export default function Footer({ forceShow = false }: { forceShow?: boolean } = {}) {
  const pathname = usePathname();

  if (
    !forceShow &&
    (pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/profile" ||
      pathname.startsWith("/profile/") ||
      pathname === "/login" ||
      pathname === "/register")
  ) {
    return null;
  }

  const footerLinks = [
    {
      title: "Pendaftaran",
      links: [
        { label: "Seminar Nasional", href: "/seminar-nasional" },
        { label: "Mechatura", href: "/mechatura" },
        { label: "Lomba Esai", href: "/lomba-esai" },
      ],
    },
    {
      title: "Tautan Bantuan",
      links: [
        { label: "Pertanyaan Umum (FAQ)", href: "/faq" },
        { label: "Syarat & Ketentuan", href: "/terms" },
        { label: "Kebijakan Privasi", href: "/privacy" },
        { label: "Pemulihan Akun", href: "/forgot-password" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Mail size={16} />,
      text: "unpad.futura@gmail.com",
      href: "mailto:unpad.futura@gmail.com",
    },
    {
      icon: <Phone size={16} />,
      text: "Mian (0896-3843-9515)",
      href: "https://wa.me/+6289638439515",
    },
    {
      icon: <MapPin size={16} />,
      text: "Universitas Padjadjaran, Dipatiukur",
    },
  ];

  return (
    <footer className="relative w-full text-neutral-300 pt-24 pb-12 mt-10 border-t bg-neutral-950/20 backdrop-blur-sm rounded-4xl">
      <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-20">

          {/* Left: Brand & Description */}
          <div className="flex flex-col items-start max-w-sm">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tighter">
                Futura
              </h2>
            </Link>
            <p className="font-light leading-relaxed mb-8 text-balance">
              Futura adalah acara teknologi universitas yang menampilkan seminar, kompetisi robotik, dan diseminasi riset.
            </p>

            {/* Socials */}
            <div className="flex gap-4">
              <AnimatedSocialLink
                href="https://instagram.com/futuraunpad.hmte"
                icon={<InstagramIcon size={20} />}
                label="Instagram"
              />
              <AnimatedSocialLink
                href="https://www.tiktok.com/@futuraunpad"
                icon={<TikTokIcon size={20} />}
                label="TikTok"
              />
            </div>
          </div>

          {/* Right: Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 lg:gap-16 w-full lg:w-auto">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex flex-col">
                <h3 className="text-white font-medium tracking-tight mb-6">{section.title}</h3>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="group flex items-center hover:text-amber-300 transition-colors text-sm font-light">
                        <span className="relative overflow-hidden pb-1">
                          {link.label}
                          <span className="absolute left-0 bottom-0 w-full h-[1px] bg-amber-300 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Information */}
            <div className="flex flex-col">
              <h3 className="text-white font-medium tracking-tight mb-6">Hubungi Kami</h3>
              <ul className="flex flex-col gap-5">
                {contactInfo.map((info, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-light group">
                    <span className="mt-0.5 text-white/40 group-hover:text-amber-300 transition-colors duration-300">{info.icon}</span>
                    {info.href ? (
                      <a href={info.href} className="hover:text-amber-300 transition-colors duration-300">{info.text}</a>
                    ) : (
                      <span>{info.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-xs font-light">
          <p>&copy; {new Date().getFullYear()} Futura. Hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
