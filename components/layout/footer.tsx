/* eslint-disable */
"use client";
import {
  Mail,
  Phone,
  MapPin,
  Book,
  Camera,
  BirdIcon,
  Balloon,
  EarthIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FooterBackgroundGradient,
  TextHoverEffect,
} from "../ui/hover-footer";

const footerLayout = {
  giantTitle: "relative z-10 hidden h-[30rem] -my-10 lg:flex",
  content: "relative z-40 max-w-7xl mx-auto p-4 md:p-8",
};

const footerEntryAnimation = {
  initial: { opacity: 0, y: 44 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: {
    duration: 0.85,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

export default function HoverFooter() {
  const pathname = usePathname();

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
  ) {
    return null;
  }

  // Footer link data
  const footerLinks = [
    {
      title: "Registrations",
      links: [
        { label: "National Seminar", href: "#" },
        { label: "Mechatura", href: "#" },
        { label: "Essay Competition", href: "#" },
      ],
    },
    {
      title: "Helpful Links",
      links: [
        { label: "FAQs", href: "/faq" },
        { label: "Guidelines", href: "#", },
        { label: "Support", href: "#" },
        { label: "Account Recovery", href: "#", },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#b246ff]" />,
      text: "unpad.futura@gmail.com",
      href: "mailto:unpad.futura@gmail.com",
    },
    {
      icon: <Phone size={18} className="text-[#b246ff]" />,
      text: "+62 HUMAS",
      href: "tel:",
    },
    {
      icon: <MapPin size={18} className="text-[#b246ff]" />,
      text: "Universitas Padjadjaran, Dipatiukur",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Book size={20} />, label: "Facebook", href: "#" },
    { icon: <Camera size={20} />, label: "Instagram", href: "#" },
    { icon: <BirdIcon size={20} />, label: "Twitter", href: "#" },
    { icon: <Balloon size={20} />, label: "Dribbble", href: "#" },
    { icon: <EarthIcon size={20} />, label: "Globe", href: "#" },
  ];

  return (
    <motion.footer
      className="relative h-fit rounded-3xl overflow-hidden will-change-transform"
      initial={footerEntryAnimation.initial}
      whileInView={footerEntryAnimation.whileInView}
      viewport={footerEntryAnimation.viewport}
      transition={footerEntryAnimation.transition}
    >

      <div className={footerLayout.content}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold">Futura</span>
            </div>
            <p className="text-sm leading-relaxed">
              Futura is Something something sokething
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <Link
                      href={link.href}
                      className="hover:text-[#b246ff] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={item.text} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-[#b246ff] transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-[#b246ff] transition-colors">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Text hover effect */}
        <div className={footerLayout.giantTitle}>
          <TextHoverEffect text="Futura" className="z-50" />
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Social icons */}
          <div className="flex space-x-6 text-gray-400">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-[#b246ff] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Futura. All rights reserved.
          </p>
        </div>
      </div>

      <FooterBackgroundGradient />
    </motion.footer>
  );
}
