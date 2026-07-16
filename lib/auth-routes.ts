const authRequiredPathPrefixes = [
  "/profile",
  "/payment",
  "/mechatura/form",
  "/lomba-essay/form",
  "/seminar-nasional/form",
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
