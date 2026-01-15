export type PriceBounds = {
  min: number;
  max: number;
};

export type FiltersState = {
  stops: number[];
  airlines: string[];
  priceRange: [number, number];
};

type ParsedFilterParams = {
  stops: number[];
  airlines: string[];
  priceMin?: number;
  priceMax?: number;
};

const allowedStops = new Set([0, 1, 2]);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseFilterParams(params: URLSearchParams): ParsedFilterParams {
  const stopsParam = params.get("stops") ?? "";
  const stops = stopsParam
    .split(",")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => allowedStops.has(value));

  const airlinesParam = params.get("airlines") ?? "";
  const airlines = airlinesParam
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  const priceMinRaw = Number.parseFloat(params.get("priceMin") ?? "");
  const priceMaxRaw = Number.parseFloat(params.get("priceMax") ?? "");

  return {
    stops,
    airlines,
    priceMin: Number.isFinite(priceMinRaw) ? priceMinRaw : undefined,
    priceMax: Number.isFinite(priceMaxRaw) ? priceMaxRaw : undefined,
  };
}

export function buildFiltersFromParams(
  params: URLSearchParams,
  priceBounds: PriceBounds
): FiltersState {
  const parsed = parseFilterParams(params);

  const rangeMin = clamp(
    parsed.priceMin ?? priceBounds.min,
    priceBounds.min,
    priceBounds.max
  );
  const rangeMax = clamp(
    parsed.priceMax ?? priceBounds.max,
    priceBounds.min,
    priceBounds.max
  );

  return {
    stops: parsed.stops,
    airlines: parsed.airlines,
    priceRange: [
      Math.min(rangeMin, rangeMax),
      Math.max(rangeMin, rangeMax),
    ],
  };
}

export function writeFiltersToParams(
  params: URLSearchParams,
  filters: FiltersState,
  priceBounds: PriceBounds
): URLSearchParams {
  if (filters.stops.length > 0) {
    params.set("stops", filters.stops.join(","));
  } else {
    params.delete("stops");
  }

  if (filters.airlines.length > 0) {
    params.set("airlines", filters.airlines.join(","));
  } else {
    params.delete("airlines");
  }

  const [minPrice, maxPrice] = filters.priceRange;
  if (minPrice > priceBounds.min) {
    params.set("priceMin", Math.round(minPrice).toString());
  } else {
    params.delete("priceMin");
  }

  if (maxPrice < priceBounds.max) {
    params.set("priceMax", Math.round(maxPrice).toString());
  } else {
    params.delete("priceMax");
  }

  return params;
}

