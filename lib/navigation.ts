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
