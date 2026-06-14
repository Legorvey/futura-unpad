export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12 sm:px-8">
      <section className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-full max-w-lg animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded-full bg-muted" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-border bg-muted/50"
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-80 animate-pulse rounded-xl border border-border bg-muted/50" />
        <div className="h-80 animate-pulse rounded-xl border border-border bg-muted/50" />
      </section>
    </main>
  );
}
