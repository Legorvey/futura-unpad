const authRequiredPathPrefixes = [
  "/admin",
  "/profile",
  "/payment",
  "/registration/mechatura",
  "/registration/lomba-essay",
  "/registration/lomba-kti",
] as const;

const matchesPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function isAuthRequiredPath(pathname: string) {
  return authRequiredPathPrefixes.some((prefix) =>
    matchesPathPrefix(pathname, prefix)
  );
}

export function buildLoginRedirectHref(pathname: string, search = "") {
  const next = `${pathname}${search}`;

  return `/login?next=${encodeURIComponent(next)}`;
}
