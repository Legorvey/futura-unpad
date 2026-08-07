"use client";

import { useEffect, useState } from "react";

const LITE_MOTION_QUERY = "(max-width: 768px), (prefers-reduced-motion: reduce)";

export function useLiteMotion() {
  const [isLiteMotion, setIsLiteMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(LITE_MOTION_QUERY);
    const updatePreference = () => setIsLiteMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return isLiteMotion;
}

