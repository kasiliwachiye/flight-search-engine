import clsx from "clsx";
import { formatCurrency } from "@/lib/format";
import type { FiltersState, PriceBounds } from "@/state/filterState";

export type AirlineOption = {
  code: string;
  name: string;
};

type FiltersPanelProps = {
  filters: FiltersState;
  priceBounds: PriceBounds;
  airlines: AirlineOption[];
  currency: string;
  onStopsToggle: (value: number) => void;
  onAirlineToggle: (code: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onReset: () => void;
  disabled?: boolean;
};

const stopsOptions = [
  { label: "Nonstop", value: 0 },
  { label: "1 stop", value: 1 },
  { label: "2+ stops", value: 2 },
];

export default function FiltersPanel({
  filters,
  priceBounds,
  airlines,
  currency,
  onStopsToggle,
  onAirlineToggle,
  onPriceChange,
  onReset,
  disabled = false,
}: FiltersPanelProps) {
  const [minPrice, maxPrice] = filters.priceRange;
  const rangeDisabled = disabled || priceBounds.max <= priceBounds.min;

  return (
    <aside className="flex h-fit flex-col gap-6 rounded-3xl border border-border bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Filters
          </p>
          <p className="text-sm text-muted">Refine your search</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted hover:text-ink"
          disabled={disabled}
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Stops
        </p>
        <div className="flex flex-col gap-2">
          {stopsOptions.map((option) => (
            <label
              key={option.value}
              className={clsx(
                "flex items-center gap-2 text-sm",
                disabled ? "text-muted" : "text-ink"
              )}
            >
              <input
                type="checkbox"
                checked={filters.stops.includes(option.value)}
                onChange={() => onStopsToggle(option.value)}
                disabled={disabled}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Price range
        </p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{formatCurrency(minPrice, currency)}</span>
          <span>{formatCurrency(maxPrice, currency)}</span>
        </div>
        <div className="relative flex flex-col gap-3">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={minPrice}
            onChange={(event) => {
              const nextMin = Math.min(
                Number(event.target.value),
                maxPrice
              );
              onPriceChange([nextMin, maxPrice]);
            }}
            disabled={rangeDisabled}
            className="w-full accent-accent"
          />
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={maxPrice}
            onChange={(event) => {
              const nextMax = Math.max(
                Number(event.target.value),
                minPrice
              );
              onPriceChange([minPrice, nextMax]);
            }}
            disabled={rangeDisabled}
            className="w-full accent-accent"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Airlines
        </p>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {airlines.length === 0 ? (
            <p className="text-xs text-muted">Airlines appear after search.</p>
          ) : (
            airlines.map((airline) => (
              <label
                key={airline.code}
                className={clsx(
                  "flex items-center gap-2 text-sm",
                  disabled ? "text-muted" : "text-ink"
                )}
              >
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline.code)}
                  onChange={() => onAirlineToggle(airline.code)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                />
                <span className="text-sm">{airline.name}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

