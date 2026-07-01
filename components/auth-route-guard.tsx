"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { buildLoginRedirectHref, isAuthRequiredPath } from "@/lib/auth-routes";

export default function AuthRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || user || !isAuthRequiredPath(pathname)) {
      return;
    }

    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

    router.replace(buildLoginRedirectHref(pathname, search));
  }, [isLoading, pathname, router, searchParams, user]);

  return null;
}
