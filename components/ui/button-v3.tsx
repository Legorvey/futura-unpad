"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ButtonV3Props {
  text: string;
  href: string;
  requireAuth?: boolean;
  className?: string;
}

export function ButtonV3({ text, href, requireAuth, className }: ButtonV3Props) {
  const isAnchor = href.startsWith("#");
  const { user, isLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const router = useRouter();

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

  return (
    <>
      <motion.div whileTap={{ scale: 0.95 }} className={cn("w-fit", className)}>
        <Link
          href={href}
          prefetch={true}
          onClick={handleClick}
          className="group relative inline-flex h-12 md:h-14 w-fit items-center justify-center overflow-hidden rounded-full bg-white text-black"
        >
          {/* Sliding Background */}
          <div className="absolute inset-0 z-0 h-full w-full -translate-x-full rounded-full bg-amber-300 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />

          {/* Circle with arrow */}
          <div className="absolute left-2 z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:left-[calc(100%-2.5rem)] md:group-hover:left-[calc(100%-3rem)]">
            <ArrowRight className="h-5 w-5 transition-colors duration-700 group-hover:text-amber-300" />
          </div>

          {/* Text */}
          <span className="relative z-10 pl-13 md:pl-16 pr-6 text-md md:text-lg font-medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pl-6 group-hover:pr-13 md:group-hover:pr-16">
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
