"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  type AuthSession,
  type AuthSessionUser,
} from "@/lib/api/auth-session";
import { queryKeys } from "@/lib/query/keys";
import { useAuthSessionQuery } from "@/hooks/queries/use-auth-session-query";
import { createClient } from "@/utils/supabase/client";

export type AuthUser = AuthSessionUser;

type AuthContextValue = {
  user: AuthUser | null;
  adminAccess: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const supabase = createClient();

const toAuthUser = (user: { id: string; email?: string | null; user_metadata?: AuthUser["user_metadata"] } | null) =>
  user ? { id: user.id, email: user.email ?? null, user_metadata: user.user_metadata } : null;

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: AuthSession | null;
}) {
  const queryClient = useQueryClient();
  const authSession = useAuthSessionQuery({ initialData: initialSession ?? undefined });
  const [isMutatingAuth, setIsMutatingAuth] = useState(false);
  const user = authSession.data?.user ?? null;
  const adminAccess = authSession.data?.adminAccess ?? false;

  const setCachedSession = useCallback(
    (nextSession: AuthSession) => {
      queryClient.setQueryData(queryKeys.auth.session, nextSession);
    },
    [queryClient]
  );

  const refreshAuth = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    setIsMutatingAuth(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsMutatingAuth(false);
      return { error };
    }

    setCachedSession({ user: null, adminAccess: false });
    setIsMutatingAuth(false);

    return { error: null };
  }, [setCachedSession]);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = toAuthUser(session?.user ?? null);

      if (!isMounted) {
        return;
      }

      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (!nextUser) {
        setCachedSession({ user: null, adminAccess: false });
        return;
      }

      const currentSession = queryClient.getQueryData<AuthSession>(queryKeys.auth.session);
      const isSameUser = currentSession?.user?.id === nextUser.id;
      const adminAccess = isSameUser ? (currentSession?.adminAccess ?? false) : false;

      setCachedSession({ user: nextUser, adminAccess });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, setCachedSession]);

  const value = useMemo(
    () => ({
      user,
      adminAccess,
      isLoading: authSession.isLoading || isMutatingAuth,
      refreshAuth,
      signOut,
    }),
    [authSession.isLoading, adminAccess, isMutatingAuth, refreshAuth, signOut, user]
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
