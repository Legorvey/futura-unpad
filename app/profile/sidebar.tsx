"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileDashboardSidebarProps {
  children: React.ReactNode;
}

export default function ProfileDashboardSidebar({
  children
}: ProfileDashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Bulletproof body scroll locking when mobile sidebar is open
  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    if (!mediaQuery.matches) return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const onToggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Backdrop - Dark Blur & Touch Locked */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md lg:hidden transition-opacity duration-300 touch-none select-none overscroll-none"
          onClick={onToggle}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      <div 
        className={cn(
          "shrink-0 transition-transform duration-300 ease-in-out flex flex-col",
          // Desktop: static/embedded flow, fixed width, always visible
          "lg:relative lg:w-80 xl:w-96 lg:h-auto lg:translate-x-0 lg:bg-muted/10 lg:border-r lg:border-border/50 lg:z-0 lg:rounded-l-2xl lg:transition-none",
          // Mobile: fixed off-canvas drawer from the left
          "fixed inset-y-0 left-0 z-[101] h-[100dvh] w-[300px] bg-card text-card-foreground border-r border-border shadow-2xl lg:shadow-none touch-pan-y",
          isOpen ? "translate-x-0" : "-translate-x-full" 
        )}
      >
        {/* Ponytail Toggle (Mobile Only) */}
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="profile-sidebar-content"
          className={cn(
            "absolute top-[30%] z-[102] flex items-center justify-center border shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden",
            "-right-6 h-16 w-6 rounded-r-xl border-l-0",
            isOpen 
              ? "border-border bg-card text-muted-foreground hover:text-foreground" 
              : "border-primary bg-primary text-primary-foreground shadow-md"
          )}
          aria-label={isOpen ? "Tutup profil" : "Buka profil"}
        >
          <span className="lg:hidden">
            {isOpen ? <ChevronLeft className="h-4 w-4" aria-hidden="true" /> : <User className="h-4 w-4" aria-hidden="true" />}
          </span>
        </button>

        {/* Sidebar Content Wrapper */}
        <div className={cn(
          "flex-1 lg:flex-none overflow-y-auto overflow-x-hidden flex flex-col p-6 sm:p-8 lg:p-10 space-y-6 overscroll-contain",
          "lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50"
        )}>
          <div 
            id="profile-sidebar-content"
            className="flex-1 flex flex-col gap-6"
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
