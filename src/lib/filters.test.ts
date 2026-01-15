import { describe, expect, it } from "vitest";
import { applyFilters } from "@/lib/filters";
import type { FlightOffer } from "@/domain/types";
import type { FiltersState } from "@/state/filterState";

const offers: FlightOffer[] = [
  {
    id: "A",
    price: { total: 200, currency: "USD" },
    itineraries: [],
    stopsCount: 0,
    airlines: ["AA"],
  },
  {
    id: "B",
    price: { total: 400, currency: "USD" },
    itineraries: [],
    stopsCount: 1,
    airlines: ["DL"],
  },
  {
    id: "C",
    price: { total: 600, currency: "USD" },
    itineraries: [],
    stopsCount: 2,
    airlines: ["UA"],
  },
];

const baseFilters: FiltersState = {
  stops: [],
  airlines: [],
  priceRange: [0, 1000],
};

describe("applyFilters", () => {
  it("returns all offers when no filters applied", () => {
    const results = applyFilters(offers, baseFilters);
    expect(results).toHaveLength(3);
  });

  it("filters by stops", () => {
    const results = applyFilters(offers, {
      ...baseFilters,
      stops: [0],
    });
    expect(results.map((offer) => offer.id)).toEqual(["A"]);
  });

  it("filters by airline", () => {
    const results = applyFilters(offers, {
      ...baseFilters,
      airlines: ["DL"],
    });
    expect(results.map((offer) => offer.id)).toEqual(["B"]);
  });

  it("filters by price range", () => {
    const results = applyFilters(offers, {
      ...baseFilters,
      priceRange: [250, 500],
    });
    expect(results.map((offer) => offer.id)).toEqual(["B"]);
  });

  it("combines multiple filters", () => {
    const results = applyFilters(offers, {
      stops: [2],
      airlines: ["UA"],
      priceRange: [500, 700],
    });
    expect(results.map((offer) => offer.id)).toEqual(["C"]);
  });
});
