"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersPanel from "@/components/FiltersPanel";
import PriceChart from "@/components/PriceChart";
import { useQuery } from "@tanstack/react-query";
import ResultsList from "@/components/ResultsList";
import { EmptyState } from "@/components/EmptyStates";
import { ResultsSkeleton } from "@/components/Skeletons";
import type { FlightOffer } from "@/domain/types";
import { applyFilters, getPriceBounds } from "@/lib/filters";
import { buildPriceTrend } from "@/lib/priceTrend";
import { fetchFlights } from "@/lib/flights";
import { sortOffers, type SortOption } from "@/lib/flightUtils";
import {
  buildFiltersFromParams,
  type FiltersState,
  writeFiltersToParams,
} from "@/state/filterState";
import {
  isSearchReady,
  parseSearchParams,
  searchKeyFromState,
} from "@/state/urlState";

const emptyOffers: FlightOffer[] = [];
const emptyCarriers: Record<string, string> = {};

export default function ResultsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchState = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );
  const enabled = isSearchReady(searchState);
  const searchKey = useMemo(() => searchKeyFromState(searchState), [searchState]);

  const [sort, setSort] = useState<SortOption>("cheapest");

  const query = useQuery({
    queryKey: ["flights", searchKey],
    queryFn: () => fetchFlights(searchState),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const offers = query.data?.offers ?? emptyOffers;
  const carriers = query.data?.carriers ?? emptyCarriers;

  const priceBounds = useMemo(() => getPriceBounds(offers), [offers]);
  const filters = useMemo(
    () => buildFiltersFromParams(searchParams, priceBounds),
    [searchParams, priceBounds]
  );
  const filteredOffers = useMemo(
    () => applyFilters(offers, filters),
    [offers, filters]
  );
  const sortedOffers = useMemo(
    () => sortOffers(filteredOffers, sort),
    [filteredOffers, sort]
  );
  const currency = offers[0]?.price.currency ?? "USD";
  const returnDate =
    searchState.tripType === "roundtrip" ? searchState.returnDate : undefined;
  const trendData = useMemo(
    () => buildPriceTrend(filteredOffers, searchState.departDate, returnDate),
    [filteredOffers, returnDate, searchState.departDate]
  );

  const airlineOptions = useMemo(() => {
    const codes = new Set<string>();
    offers.forEach((offer) => {
      offer.airlines.forEach((code) => codes.add(code));
    });

    return Array.from(codes)
      .sort()
      .map((code) => ({
        code,
        name: carriers[code] ?? code,
      }));
  }, [offers, carriers]);

  const updateFilters = (nextFilters: FiltersState) => {
    const params = new URLSearchParams(searchParams.toString());
    writeFiltersToParams(params, nextFilters, priceBounds);
    const queryString = params.toString();
    router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  const toggleStop = (value: number) => {
    const nextStops = filters.stops.includes(value)
      ? filters.stops.filter((stop) => stop !== value)
      : [...filters.stops, value].sort();

    updateFilters({ ...filters, stops: nextStops });
  };

  const toggleAirline = (code: string) => {
    const nextAirlines = filters.airlines.includes(code)
      ? filters.airlines.filter((airline) => airline !== code)
      : [...filters.airlines, code].sort();

    updateFilters({ ...filters, airlines: nextAirlines });
  };

  const resetFilters = () => {
    updateFilters({
      stops: [],
      airlines: [],
      priceRange: [priceBounds.min, priceBounds.max],
    });
  };

  if (!enabled) {
    return (
      <EmptyState
        title="Start with a search"
        description="Enter a route and dates to see live flight options."
      />
    );
  }

  if (query.isLoading) {
    return <ResultsSkeleton />;
  }

  if (query.isError) {
    const message =
      query.error instanceof Error
        ? query.error.message
        : "Unable to load flights";
    return (
      <EmptyState
        title="We could not load flights"
        description={message}
        variant="error"
      />
    );
  }

  if (offers.length === 0) {
    return (
      <EmptyState
        title="No results match this search"
        description="Try adjusting dates, cabin, or travelers to see more options."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <FiltersPanel
        filters={filters}
        priceBounds={priceBounds}
        airlines={airlineOptions}
        currency={currency}
        onStopsToggle={toggleStop}
        onAirlineToggle={toggleAirline}
        onPriceChange={(range) =>
          updateFilters({ ...filters, priceRange: range })
        }
        onReset={resetFilters}
      />
      <div className="flex flex-col gap-6">
        {trendData.length > 0 && (
          <PriceChart data={trendData} currency={currency} />
        )}
        {sortedOffers.length === 0 ? (
          <EmptyState
            title="No flights match these filters"
            description="Try widening the price range or clearing an airline filter."
          />
        ) : (
          <ResultsList
            offers={sortedOffers}
            carriers={carriers}
            sort={sort}
            onSortChange={setSort}
          />
        )}
      </div>
    </div>
  );
}

