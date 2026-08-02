import { ErrorState } from "@/components/ui/error-state";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6">
      <ErrorState
        statusCode="404"
        icon={FileQuestion}
        title="Halaman Tidak Ditemukan"
        description="Halaman yang Anda tuju tidak dapat ditemukan. Mungkin tautan telah kedaluwarsa, dipindahkan, atau alamat yang dimasukkan salah."
        actionHref="/"
        actionLabel="Kembali ke Beranda"
        secondaryActionHref="/faq"
        secondaryActionLabel="Pusat Bantuan & FAQ"
        tone="neutral"
      />
    </main>
  );
}
