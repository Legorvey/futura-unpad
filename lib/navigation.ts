export function isInternalAppHref(href: string | undefined): href is string {
  if (!href) {
    return false;
  }

  // Don't treat hash-only links as internal (next/link) so they render as standard <a> tags
  // This allows Lenis to handle the smooth scrolling naturally without conflicts.
  return (href.startsWith("/") && !href.startsWith("//"));
}

export function toInternalAppHref(href: string, origin: string) {
  if (isInternalAppHref(href)) {
    return href;
  }

  try {
    const url = new URL(href);

    if (url.origin !== origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/**
 * Restricts a redirect destination to within the /admin subtree only.
 * Used by the MFA verification flow to ensure admin redirects never steer
 * users to participant-facing surfaces (e.g. /profile, /seminar-nasional).
 */
export function getSafeAdminRedirectPath(
  value: string | string[] | null | undefined,
  defaultPath = "/admin"
): string {
  const target = Array.isArray(value) ? value[0] : value;
  if (
    target &&
    target.startsWith("/admin") &&
    !target.startsWith("/admin/..")
  ) {
    return target;
  }
  return defaultPath;
}

export function getSafeRedirectPath(value: string | string[] | null | undefined, defaultPath = "/profile"): string {
  const next = Array.isArray(value) ? value[0] : value;

  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\") ||
    next.startsWith("/login") ||
    next === "/register" ||
    next.startsWith("/register?") ||
    next.startsWith("/auth/callback")
  ) {
    return defaultPath;
  }

  return next;
}
