export function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-border bg-white/80 p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-border/70" />
              <div className="h-5 w-48 rounded-full bg-border/60" />
              <div className="h-3 w-32 rounded-full bg-border/50" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 rounded-full bg-border/60" />
              <div className="h-10 w-20 rounded-full bg-border/50" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((__, legIndex) => (
              <div
                key={legIndex}
                className="h-12 rounded-2xl border border-border/60 bg-white/70"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

