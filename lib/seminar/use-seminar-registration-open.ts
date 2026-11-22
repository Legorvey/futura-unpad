"use client";

import { useSyncExternalStore } from "react";
import {
  SEMINAR_REG_CLOSE_ISO,
  SEMINAR_REG_START_ISO,
  isSeminarRegistrationOpen,
} from "@/lib/seminar/config";

function subscribe(callback: () => void) {
  const now = Date.now();
  const timers: number[] = [];
  const startMs = new Date(SEMINAR_REG_START_ISO).getTime();
  const closeMs = new Date(SEMINAR_REG_CLOSE_ISO).getTime();

  if (startMs > now) {
    timers.push(
      window.setTimeout(callback, Math.min(startMs - now, 2_147_483_647))
    );
  }
  if (closeMs > now) {
    timers.push(
      window.setTimeout(callback, Math.min(closeMs - now, 2_147_483_647))
    );
  }

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
  };
}

export function useSeminarRegistrationOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isSeminarRegistrationOpen(),
    () => true
  );
}
