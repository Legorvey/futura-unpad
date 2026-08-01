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
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6">
      <ErrorState
        statusCode="500"
        icon={ServerCrash}
        title="Terjadi Kesalahan Sistem"
        description="Mohon maaf, terjadi kendala saat memproses permintaan Anda. Tim teknis kami telah mencatat kendala ini."
        onAction={reset}
        actionLabel="Coba Lagi"
        secondaryActionHref="/"
        secondaryActionLabel="Kembali ke Beranda"
        tone="destructive"
      />
      {error.digest && (
        <p className="mt-4 text-xs text-white/30 font-mono select-all text-center">
          Digest: {error.digest}
        </p>
      )}
    </main>
  );
}
