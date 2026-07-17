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
}

export function ButtonV2({ text, href, requireAuth }: ButtonV2Props) {
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
      <Link href={href} prefetch={true} onClick={handleClick} className="cursor-pointer px-6 py-2 w-fit rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200 block text-center">
        {text}
      </Link>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to login or register first to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" asChild>
              <Link href={`/register?next=${encodeURIComponent(href)}`}>Create Account</Link>
            </Button>
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(href)}`}>Log In</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
