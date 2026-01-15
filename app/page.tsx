export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
            Skybound
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            Flight search with live price perspective.
          </h1>
          <p className="max-w-2xl text-base text-muted sm:text-lg">
            Compare options fast, filter every detail, and watch price trends
            update the moment you refine your search.
          </p>
        </header>
        <section className="rounded-3xl border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 text-sm text-muted">
            <div className="h-3 w-24 rounded-full bg-border/70" />
            <div className="h-4 w-60 rounded-full bg-border/60" />
            <div className="h-4 w-40 rounded-full bg-border/50" />
          </div>
        </section>
      </div>
    </main>
  );
}
