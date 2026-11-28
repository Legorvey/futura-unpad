"use client";

import { useSyncExternalStore } from "react";
import {
  SEMINAR_EVENT_DATE_ISO,
  SEMINAR_REG_CLOSE_ISO,
  SEMINAR_REG_START_ISO,
  isSeminarEventOngoing,
  isSeminarRegistrationOpen,
} from "@/lib/seminar/config";

function subscribeBoundary(
  startIso: string,
  closeIso: string,
  callback: () => void
) {
  const now = Date.now();
  const timers: number[] = [];
  const startMs = new Date(startIso).getTime();
  const closeMs = new Date(closeIso).getTime();

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

function subscribe(callback: () => void) {
  return subscribeBoundary(SEMINAR_REG_START_ISO, SEMINAR_REG_CLOSE_ISO, callback);
}

function subscribeOngoing(callback: () => void) {
  return subscribeBoundary(SEMINAR_EVENT_DATE_ISO, SEMINAR_REG_CLOSE_ISO, callback);
}

export function useSeminarRegistrationOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isSeminarRegistrationOpen(),
    () => isSeminarRegistrationOpen()
  );
}

export function useSeminarEventOngoing(): boolean {
  return useSyncExternalStore(
    subscribeOngoing,
    () => isSeminarEventOngoing(),
    () => isSeminarEventOngoing()
  );
}
