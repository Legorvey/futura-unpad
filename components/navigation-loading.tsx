"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const isMainClick = (event: MouseEvent) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

export default function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useMemo(() => searchParams.toString(), [searchParams]);
  const routeKey = `${pathname}?${search}`;
  const previousRouteKey = useRef(routeKey);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (previousRouteKey.current === routeKey) {
      return;
    }

    previousRouteKey.current = routeKey;
    const timeout = window.setTimeout(() => setIsLoading(false), 0);

    return () => window.clearTimeout(timeout);
  }, [routeKey]);

  useEffect(() => {
    const startLoading = () => setIsLoading(true);

    const handleClick = (event: MouseEvent) => {
      if (!isMainClick(event) || event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || anchor.target || anchor.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search
      ) {
        return;
      }

      startLoading();
    };

    window.addEventListener("beforeunload", startLoading);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", startLoading);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timeout = window.setTimeout(() => setIsLoading(false), 8000);

    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-transparent transition-opacity duration-200 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!isLoading}
    >
      <div 
        className={cn(
          "h-full w-1/2 animate-[navigation-loading_1.1s_ease-in-out_infinite] rounded-r-full shadow-sm transition-colors duration-700 ease-in-out",
          isScrolled ? "bg-black" : "bg-white"
        )} 
      />
    </div>
  );
}
