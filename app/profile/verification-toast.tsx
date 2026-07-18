"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function VerificationToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isToastShown = useRef(false);

    useEffect(() => {
        if (!isToastShown.current) {
            const verified = searchParams.get("verified");
            const emailChange = searchParams.get("email_change");

            let shouldCleanUrl = false;
            
            if (verified === "1") {
                isToastShown.current = true;
                shouldCleanUrl = true;
                toast.success("Email verified successfully!", {
                    description: "Your account is now fully verified.",
                });
            } else if (emailChange === "pending") {
                isToastShown.current = true;
                shouldCleanUrl = true;
                toast.info("One more step!", {
                    description: "Email partially verified. Please check the other email address to complete the change.",
                });
            } else if (emailChange === "success") {
                isToastShown.current = true;
                shouldCleanUrl = true;
                toast.success("Email changed successfully!", {
                    description: "Your account email has been updated.",
                });
            }

            if (shouldCleanUrl) {
                // Clean up the URL by removing the query param
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("verified");
                newUrl.searchParams.delete("email_change");
                router.replace(newUrl.pathname + newUrl.search + newUrl.hash);
            }
        }
    }, [searchParams, router]);

    return null;
}
