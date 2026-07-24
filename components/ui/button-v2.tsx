"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <div className={`relative group inline-block ${className || ""}`}>
        {/* Glowing aura background on hover */}
        <div
          className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 opacity-0 blur-md group-hover:opacity-85 transition-all duration-300 group-hover:duration-200"
          aria-hidden="true"
        />

        {/* Primary button */}
        <Link
          href={href}
          prefetch={true}
          onClick={handleClick}
          className="relative cursor-pointer px-6 py-2 w-fit rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] active:scale-[0.98] transition-all duration-300 block text-center"
        >
          {text}
        </Link>
      </div>

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
