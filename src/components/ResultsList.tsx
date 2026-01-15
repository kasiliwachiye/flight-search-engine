import type { FlightOffer } from "@/domain/types";
import { formatCurrency, formatStops } from "@/lib/format";
import { getTotalDurationMinutes, type SortOption } from "@/lib/flightUtils";
import { formatDuration, formatTime } from "@/lib/time";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Cheapest", value: "cheapest" },
  { label: "Fastest", value: "fastest" },
  { label: "Best", value: "best" },
];

type ResultsListProps = {
  offers: FlightOffer[];
  carriers: Record<string, string>;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
};

function resolveAirlines(
  offer: FlightOffer,
  carriers: Record<string, string>
): string {
  const names = offer.airlines.map((code) => carriers[code] ?? code);
  return names.join(", ");
}

export default function ResultsList({
  offers,
  carriers,
  sort,
  onSortChange,
}: ResultsListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Results
          </p>
          <p className="text-sm text-muted">{offers.length} options found</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Sort
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="h-10 rounded-full border border-border bg-white/80 px-3 text-xs text-ink"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4">
        {offers.map((offer) => {
          const airlines = resolveAirlines(offer, carriers);
          const totalDuration = formatDuration(getTotalDurationMinutes(offer));

          return (
            <article
              key={offer.id}
              className="rounded-3xl border border-border bg-white/90 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    Airlines
                  </p>
                  <p className="text-base font-semibold text-ink">{airlines}</p>
                  <p className="text-xs text-muted">
                    Total trip time {totalDuration}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      Total
                    </p>
                    <p className="text-2xl font-semibold text-ink">
                      {formatCurrency(offer.price.total, offer.price.currency)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-ink/90"
                  >
                    Select
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {offer.itineraries.map((itinerary, index) => {
                  const firstSegment = itinerary.segments[0];
                  const lastSegment = itinerary.segments[itinerary.segments.length - 1];
                  const stops = itinerary.segments.length - 1;
                  const label =
                    offer.itineraries.length > 1
                      ? index === 0
                        ? "Outbound"
                        : "Return"
                      : "Flight";

                  return (
                    <div
                      key={`${offer.id}-${index}`}
                      className="rounded-2xl border border-border/60 bg-white/70 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                          <span>{formatTime(firstSegment.departure.at)}</span>
                          <span className="text-muted">
                            {firstSegment.departure.iataCode}
                          </span>
                          <span className="text-muted">?</span>
                          <span>{formatTime(lastSegment.arrival.at)}</span>
                          <span className="text-muted">
                            {lastSegment.arrival.iataCode}
                          </span>
                        </div>
                        <div className="text-xs text-muted">
                          {formatDuration(itinerary.durationMinutes)} · {formatStops(stops)}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        {label} · {itinerary.segments.length} segments
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

