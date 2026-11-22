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
      allowNestedScroll: true,
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
      if (!href) return;

      let hashTarget: string | null = null;
      if (href.startsWith('#') && href.length > 1) {
        hashTarget = href;
      } else if (href.startsWith('/#') && (pathname === '/' || !pathname)) {
        hashTarget = href.substring(1);
      } else if (href.includes('#')) {
        const [path, hash] = href.split('#');
        if (path === pathname && hash) {
          hashTarget = `#${hash}`;
        }
      }

      if (hashTarget) {
        e.preventDefault();
        if (hashTarget === '#sponsors') {
          const isMobile = window.innerWidth < 768;
          const targetEl = document.getElementById(isMobile ? 'sponsors-mobile' : 'sponsors');
          if (targetEl) {
            lenis.scrollTo(targetEl, { offset: isMobile ? -80 : 0 });
            window.history.pushState(null, '', hashTarget);
            return;
          }
        }
        lenis.scrollTo(hashTarget);
        window.history.pushState(null, '', hashTarget);
      }
    };

    document.addEventListener('click', handleHashClick);

    // If the page loads with a hash, scroll to it smoothly
    if (window.location.hash) {
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash === '#sponsors') {
          const isMobile = window.innerWidth < 768;
          const targetEl = document.getElementById(isMobile ? 'sponsors-mobile' : 'sponsors');
          if (targetEl) {
            lenis.scrollTo(targetEl, { offset: isMobile ? -80 : 0 });
            return;
          }
        }
        lenis.scrollTo(hash);
      }, 150);
    }

    return () => {
      document.removeEventListener('click', handleHashClick);
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [pathname])

  useEffect(() => {
    if (lenisRef.current) {
      // Force lenis to recalculate height and scroll to top on page change
      lenisRef.current.resize();
      
      // If we navigated to a hash, scroll to it smoothly once rendered
      if (window.location.hash) {
        const hash = window.location.hash;
        setTimeout(() => {
          if (hash === '#sponsors') {
            const isMobile = window.innerWidth < 768;
            const targetEl = document.getElementById(isMobile ? 'sponsors-mobile' : 'sponsors');
            if (targetEl) {
              lenisRef.current?.scrollTo(targetEl, { offset: isMobile ? -80 : 0 });
              return;
            }
          }
          lenisRef.current?.scrollTo(hash);
        }, 150);
      } else {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, searchParams]);

  return <>{children}</>
}
