"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ButtonV2Props {
  text: string;
  href: string;
  requireAuth?: boolean;
  className?: string;
}

export function ButtonV2({ text, href, requireAuth, className }: ButtonV2Props) {
  const isAnchor = href.startsWith("#");
  const { user, isLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const router = useRouter();

  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCentered, setIsCentered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (requireAuth && !isLoading && !user) {
      e.preventDefault();
      setShowAuthDialog(true);
      return;
    }

    if (isAnchor) {
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Expand when within 35% of the button width from center
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
    <>
      <motion.div whileTap={{ scale: 0.95 }} className="w-fit">
        <Link 
          href={href} 
          prefetch={true} 
          onClick={handleClick}
          ref={buttonRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => { setIsHovered(false); setIsCentered(false); }}
          className="group relative inline-flex overflow-hidden rounded-full cursor-pointer text-lg px-6 py-2 w-fit bg-white text-black transition-colors duration-200"
        >
          {/* Tracking circle */}
          <motion.div
            initial={false}
            animate={{
              x: mousePos.x - 20,
              y: mousePos.y - 20,
              scale: isCentered ? 20 : (isHovered ? 1 : 0),
            }}
            transition={{
              scale: { duration: 0.45, ease: "easeInOut" },
              x: { type: "spring", stiffness: 400, damping: 25 },
              y: { type: "spring", stiffness: 400, damping: 25 }
            }}
            className="pointer-events-none absolute left-0 top-0 z-0 h-10 w-10 rounded-full bg-amber-300"
          />
          <span className="relative z-10 font-medium transition-colors duration-500 group-hover:text-black">
            {text}
          </span>
        </Link>
      </motion.div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Otentikasi Diperlukan</DialogTitle>
            <DialogDescription>
              Anda harus masuk atau mendaftar terlebih dahulu untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" asChild>
              <Link href={`/register?next=${encodeURIComponent(href)}`}>Buat Akun</Link>
            </Button>
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(href)}`}>Masuk</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
