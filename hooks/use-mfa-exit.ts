"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

/**
 * useMfaExit — MFA page exit guard hook.
 *
 * Intercepts two navigation vectors that would leave a dangling AAL1 session:
 *   1. The in-page "Kembali" button (handled via the returned showExitDialog state).
 *   2. The browser's Back button (intercepted via a popstate sentinel pattern).
 *
 * On confirmed exit, performs a fail-secure four-layer session teardown:
 *   1. BroadcastChannel: notify all open tabs to clear their auth state.
 *   2. TanStack Query: clear cache and set session to null immediately.
 *   3. Server: POST /api/auth/logout (GoTrue revocation + cookie eradication)
 *      executed BEFORE client signOut so the request still carries auth cookies.
 *   4. Client: wipe sb-* and futura-* cookies from document.cookie as a fallback.
 *
 * The redirect to /login uses window.location.replace() (not Next.js router) to
 * guarantee a full browser navigation that flushes the in-memory RSC payload cache
 * and all React component state.
 */
export function useMfaExit() {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const queryClient = useQueryClient();
  // Stable reference: createClient returns a singleton from @supabase/ssr
  const supabaseRef = useRef(createClient());

  // --- popstate sentinel -------------------------------------------------------
  // Push a synthetic history entry on mount so the browser always has an entry to
  // "pop" before leaving this page. When the pop fires we re-push the sentinel and
  // show the dialog instead of navigating away.
  useEffect(() => {
    window.history.pushState({ mfaProtected: true }, "", window.location.href);

    const handlePopState = () => {
      // Immediately re-push to keep the sentinel in place while the dialog is open.
      window.history.pushState({ mfaProtected: true }, "", window.location.href);
      setShowExitDialog(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // --- Fail-secure session teardown --------------------------------------------
  const confirmExit = useCallback(async () => {
    setIsExiting(true);

    try {
      // 1. Broadcast logout event to all open tabs immediately so their cached
      //    auth state is invalidated before any network request completes.
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("auth-sync");
        channel.postMessage({ type: "LOGOUT", reason: "mfa_cancelled" });
        channel.close();
      }

      // 2. Invalidate TanStack Query cache synchronously.
      queryClient.clear();
      queryClient.setQueryData(queryKeys.auth.session, {
        user: null,
        adminAccess: false,
      });

      // 3a. Revoke the session on the server FIRST while browser cookies are still intact.
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        });
      } catch {
        // Ignore network error; client-side signOut and cookie wipe below will still execute
      }

      // 3b. Clear client-side Supabase session state.
      try {
        await supabaseRef.current.auth.signOut({ scope: "local" });
      } catch {
        // Ignore client signOut error
      }
    } finally {
      // 4. Fail-secure client-side cookie wipe. This runs even if the network
      //    calls above fail, ensuring no auth cookies linger in the browser.
      if (typeof document !== "undefined") {
        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          if (name.startsWith("sb-") || name.startsWith("futura-")) {
            document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        });
      }

      toast.info("Verifikasi dibatalkan", {
        description: "Sesi Anda telah diakhiri demi keamanan.",
      });

      // Hard navigation: window.location.replace() flushes the in-memory Next.js
      // router cache, RSC payload, and all component state — safer than router.push.
      window.location.replace("/login");
    }
  }, [queryClient]);

  return {
    showExitDialog,
    setShowExitDialog,
    isExiting,
    confirmExit,
  };
}
