import type { FlightOffer } from "@/domain/types";
import type { FiltersState, PriceBounds } from "@/state/filterState";

export function getPriceBounds(offers: FlightOffer[]): PriceBounds {
  if (offers.length === 0) {
    return { min: 0, max: 0 };
  }

  const totals = offers.map((offer) => offer.price.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);

  return {
    min: Math.floor(min),
    max: Math.ceil(max),
  };
}

export function applyFilters(
  offers: FlightOffer[],
  filters: FiltersState
): FlightOffer[] {
  if (offers.length === 0) {
    return offers;
  }

  const stopsSet = new Set(filters.stops);
  const airlinesSet = new Set(filters.airlines);
  const [minPrice, maxPrice] = filters.priceRange;

  return offers.filter((offer) => {
    if (stopsSet.size > 0) {
      const stopsMatch =
        (stopsSet.has(0) && offer.stopsCount === 0) ||
        (stopsSet.has(1) && offer.stopsCount === 1) ||
        (stopsSet.has(2) && offer.stopsCount >= 2);
      if (!stopsMatch) {
        return false;
      }
    }

    if (airlinesSet.size > 0) {
      const hasAirline = offer.airlines.some((code) => airlinesSet.has(code));
      if (!hasAirline) {
        return false;
      }
    }

    if (offer.price.total < minPrice || offer.price.total > maxPrice) {
      return false;
    }

    return true;
  });
}

