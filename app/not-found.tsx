import { ErrorState } from "@/components/ui/error-state";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 pb-16 pt-32 sm:px-8">
      <div className="mb-4 text-7xl font-bold tracking-tighter text-muted/30 select-none pointer-events-none">
        404
      </div>
      <ErrorState 
        icon={FileQuestion}
        title="Page Not Found"
        description="We couldn't find the page you're looking for. It might have been moved, deleted, or never existed."
        actionHref="/"
        actionLabel="Return Home"
        className="-mt-12"
      />
    </main>
  );
}
