import type { FlightOffer } from "@/domain/types";

export type SortOption = "cheapest" | "fastest" | "best";

export function getTotalDurationMinutes(offer: FlightOffer): number {
  return offer.itineraries.reduce(
    (total, itinerary) => total + itinerary.durationMinutes,
    0
  );
}

export function sortOffers(
  offers: FlightOffer[],
  sort: SortOption
): FlightOffer[] {
  if (offers.length <= 1) {
    return offers;
  }

  if (sort === "cheapest") {
    return [...offers].sort((a, b) => a.price.total - b.price.total);
  }

  if (sort === "fastest") {
    return [...offers].sort(
      (a, b) => getTotalDurationMinutes(a) - getTotalDurationMinutes(b)
    );
  }

  const totals = offers.map((offer) => offer.price.total);
  const durations = offers.map((offer) => getTotalDurationMinutes(offer));

  const minPrice = Math.min(...totals);
  const maxPrice = Math.max(...totals);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const priceRange = maxPrice - minPrice || 1;
  const durationRange = maxDuration - minDuration || 1;

  return [...offers].sort((a, b) => {
    const priceScoreA = (a.price.total - minPrice) / priceRange;
    const durationScoreA = (getTotalDurationMinutes(a) - minDuration) / durationRange;
    const scoreA = priceScoreA * 0.65 + durationScoreA * 0.35;

    const priceScoreB = (b.price.total - minPrice) / priceRange;
    const durationScoreB = (getTotalDurationMinutes(b) - minDuration) / durationRange;
    const scoreB = priceScoreB * 0.65 + durationScoreB * 0.35;

    return scoreA - scoreB;
  });
}

