"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export type AuthUser = {
  id: string;
  email: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const supabase = createClient();

const toAuthUser = (user: { id: string; email?: string | null } | null) =>
  user ? { id: user.id, email: user.email ?? null } : null;

export function AuthProvider({
  children,
  initialUser,
  initialIsAdmin,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
  initialIsAdmin: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const authVersion = useRef(0);
  const currentUser = useRef<AuthUser | null>(initialUser);

  const setAuthUser = useCallback((nextUser: AuthUser | null) => {
    currentUser.current = nextUser;
    setUser((previousUser) => {
      const isSameUser =
        previousUser?.id === nextUser?.id &&
        previousUser?.email === nextUser?.email;

      return isSameUser ? previousUser : nextUser;
    });
  }, []);

  const checkAdmin = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    return !error && !!data;
  }, []);

  const refreshAuth = useCallback(async () => {
    const version = authVersion.current + 1;
    authVersion.current = version;
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nextUser = toAuthUser(user);

    if (version !== authVersion.current) {
      return;
    }

    setAuthUser(nextUser);
    const nextIsAdmin = nextUser ? await checkAdmin(nextUser.id) : false;

    if (version !== authVersion.current) {
      return;
    }

    setIsAdmin(nextIsAdmin);
    setIsLoading(false);
  }, [checkAdmin, setAuthUser]);

  const signOut = useCallback(async () => {
    authVersion.current += 1;
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsLoading(false);
      return { error };
    }

    setAuthUser(null);
    setIsAdmin(false);
    setIsLoading(false);

    return { error: null };
  }, [setAuthUser]);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = toAuthUser(session?.user ?? null);
      const previousUserId = currentUser.current?.id ?? null;
      const nextUserId = nextUser?.id ?? null;
      const userChanged = previousUserId !== nextUserId;
      const shouldRefreshServerState =
        event === "SIGNED_OUT" || userChanged || event === "USER_UPDATED";

      if (!isMounted) {
        return;
      }

      setAuthUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
      }

      if (nextUser && userChanged) {
        const version = authVersion.current + 1;
        authVersion.current = version;
        setIsAdmin(false);
        checkAdmin(nextUser.id).then((nextIsAdmin) => {
          if (isMounted && version === authVersion.current) {
            setIsAdmin(nextIsAdmin);
          }
        });
      }

      if (shouldRefreshServerState) {
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin, router, setAuthUser]);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      isLoading,
      refreshAuth,
      signOut,
    }),
    [isAdmin, isLoading, refreshAuth, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
};
