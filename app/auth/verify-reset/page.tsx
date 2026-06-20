"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function VerifyResetContent() {
    const router = useRouter();
    const hasFired = useRef(false);

    useEffect(() => {
        const supabase = createClient();

        const handleSuccess = () => {
            if (hasFired.current) return;
            hasFired.current = true;
            
            fetch("/api/auth/set-recovery-cookie", { method: "POST" })
                .then(() => router.push("/reset-password"))
                .catch(() => router.push("/login?error=recovery_failed"));
        };

        // Check if there's already a session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) handleSuccess();
        });

        // Listen for the hash being parsed and session being set
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
                handleSuccess();
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-r-transparent mb-4"></div>
            <p className="text-muted-foreground animate-pulse text-sm font-medium">Verifying secure link...</p>
        </div>
    );
}

export default function VerifyResetPage() {
    return (
        <Suspense fallback={null}>
            <VerifyResetContent />
        </Suspense>
    );
}
