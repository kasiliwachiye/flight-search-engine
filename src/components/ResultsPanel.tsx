"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ResultsList from "@/components/ResultsList";
import { EmptyState } from "@/components/EmptyStates";
import { ResultsSkeleton } from "@/components/Skeletons";
import type { FlightOffer } from "@/domain/types";
import { fetchFlights } from "@/lib/flights";
import { sortOffers, type SortOption } from "@/lib/flightUtils";
import {
  isSearchReady,
  parseSearchParams,
  searchKeyFromState,
} from "@/state/urlState";

const emptyOffers: FlightOffer[] = [];
const emptyCarriers: Record<string, string> = {};

export default function ResultsPanel() {
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

  const sortedOffers = useMemo(
    () => sortOffers(offers, sort),
    [offers, sort]
  );

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

  if (sortedOffers.length === 0) {
    return (
      <EmptyState
        title="No results match this search"
        description="Try adjusting dates, cabin, or travelers to see more options."
      />
    );
  }

  return (
    <ResultsList
      offers={sortedOffers}
      carriers={carriers}
      sort={sort}
      onSortChange={setSort}
    />
  );
}

