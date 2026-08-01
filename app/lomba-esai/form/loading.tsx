import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col items-center justify-center space-y-8 px-4 pb-32 pt-28 sm:px-8">
      <Skeleton className="h-10 sm:h-12 md:h-14 w-[36rem] max-w-full" />
      <Skeleton className="h-24 w-80 max-w-full rounded-2xl" />
    </main>
  );
}
