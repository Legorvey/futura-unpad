"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { ServerCrash } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Runtime error caught in error.tsx:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 pb-16 pt-32 sm:px-8">
      <div className="mb-4 text-7xl font-bold tracking-tighter text-muted/30 select-none pointer-events-none">
        500
      </div>
      <ErrorState 
        icon={ServerCrash}
        title="Something went wrong"
        description="We're sorry, but an unexpected error occurred while processing your request. Please try again."
        onAction={reset}
        actionLabel="Try again"
        className="-mt-12"
      />
    </main>
  );
}
