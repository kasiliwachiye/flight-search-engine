"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import AirportTypeahead from "@/components/AirportTypeahead";
import {
  buildSearchParams,
  defaultSearchState,
  parseSearchParams,
  SearchFormState,
} from "@/state/urlState";

const cabinOptions = [
  { label: "Economy", value: "ECONOMY" },
  { label: "Premium Economy", value: "PREMIUM_ECONOMY" },
  { label: "Business", value: "BUSINESS" },
  { label: "First", value: "FIRST" },
] as const;

export default function SearchForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formState, setFormState] = useState<SearchFormState>(defaultSearchState);

  useEffect(() => {
    setFormState(parseSearchParams(searchParams));
  }, [searchParams]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = buildSearchParams(formState);
    const params = new URLSearchParams(searchParams.toString());
    const searchKeys = [
      "origin",
      "destination",
      "departDate",
      "returnDate",
      "adults",
      "cabin",
      "trip",
    ];

    searchKeys.forEach((key) => {
      const value = nextSearch.get(key);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-border bg-white/80 p-6 shadow-[var(--shadow-soft)]"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setFormState((prev) => ({
              ...prev,
              tripType: "oneway",
              returnDate: "",
            }))
          }
          className={clsx(
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
            formState.tripType === "oneway"
              ? "border-accent bg-accent/10 text-ink"
              : "border-border text-muted hover:border-accent/60"
          )}
          aria-pressed={formState.tripType === "oneway"}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() =>
            setFormState((prev) => ({
              ...prev,
              tripType: "roundtrip",
            }))
          }
          className={clsx(
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
            formState.tripType === "roundtrip"
              ? "border-accent bg-accent/10 text-ink"
              : "border-border text-muted hover:border-accent/60"
          )}
          aria-pressed={formState.tripType === "roundtrip"}
        >
          Round Trip
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <AirportTypeahead
            label="Origin"
            placeholder="City or IATA"
            value={formState.origin}
            onChange={(value) =>
              setFormState((prev) => ({ ...prev, origin: value }))
            }
          />
        </div>
        <div className="lg:col-span-3">
          <AirportTypeahead
            label="Destination"
            placeholder="City or IATA"
            value={formState.destination}
            onChange={(value) =>
              setFormState((prev) => ({ ...prev, destination: value }))
            }
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Depart
          </label>
          <input
            type="date"
            min={today}
            value={formState.departDate}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                departDate: event.target.value,
              }))
            }
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Return
          </label>
          <input
            type="date"
            min={formState.departDate || today}
            value={formState.returnDate}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                returnDate: event.target.value,
              }))
            }
            disabled={formState.tripType === "oneway"}
            className={clsx(
              "mt-2 h-12 w-full rounded-2xl border border-border px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
              formState.tripType === "oneway"
                ? "bg-border/40 text-muted"
                : "bg-white/80"
            )}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Adults
          </label>
          <input
            type="number"
            min={1}
            max={9}
            value={formState.adults}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                adults: Number.parseInt(event.target.value, 10) || 1,
              }))
            }
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="lg:col-span-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Cabin
          </label>
          <select
            value={formState.cabin}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                cabin: event.target.value as SearchFormState["cabin"],
              }))
            }
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-white/80 px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">Any</option>
            {cabinOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Type a city or airport code. Results update on search.
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          Search flights
        </button>
      </div>
    </form>
  );
}

