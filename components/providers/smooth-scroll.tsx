"use client"

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import { usePathname, useSearchParams } from "next/navigation"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    // Handle hash link clicks manually to work with Lenis
    const handleHashClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      const target = (e.target as HTMLElement).closest('a');
      
      if (!target) return;
      
      const href = target.getAttribute('href');
      // Only intercept hash-only links (e.g., "#about")
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        lenis.scrollTo(href);
        // Optionally update the URL without triggering native scroll jump
        window.history.pushState(null, '', href);
      }
    };

    document.addEventListener('click', handleHashClick);

    // If the page loads with a hash, scroll to it smoothly
    if (window.location.hash) {
      setTimeout(() => {
        lenis.scrollTo(window.location.hash);
      }, 100);
    }

    return () => {
      document.removeEventListener('click', handleHashClick);
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) {
      // Force lenis to recalculate height and scroll to top on page change
      lenisRef.current.resize();
      
      // If we didn't just navigate to a hash, scroll to top
      if (!window.location.hash) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, searchParams]);

  return <>{children}</>
}
