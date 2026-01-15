import ResultsPanel from "@/components/ResultsPanel";
import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="min-h-screen px-6 pb-28 pt-10 lg:pb-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
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

        <SearchForm />
        <ResultsPanel />
      </div>
    </main>
  );
}
