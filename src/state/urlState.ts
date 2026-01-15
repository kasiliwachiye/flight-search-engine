import type { CabinClass } from "@/domain/types";

export type TripType = "oneway" | "roundtrip";

export type SearchFormState = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
  cabin: CabinClass | "";
  tripType: TripType;
};

export const defaultSearchState: SearchFormState = {
  origin: "",
  destination: "",
  departDate: "",
  returnDate: "",
  adults: 1,
  cabin: "",
  tripType: "oneway",
};

const cabinValues: CabinClass[] = [
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
];

export function parseSearchParams(params: URLSearchParams): SearchFormState {
  const origin = params.get("origin") ?? "";
  const destination = params.get("destination") ?? "";
  const departDate = params.get("departDate") ?? "";
  const returnDate = params.get("returnDate") ?? "";
  const cabin = params.get("cabin") ?? "";
  const trip = params.get("trip");

  const adultsParam = Number.parseInt(params.get("adults") ?? "1", 10);
  const adults = Number.isFinite(adultsParam) && adultsParam > 0 ? adultsParam : 1;

  const tripType: TripType = returnDate
    ? "roundtrip"
    : trip === "rt"
      ? "roundtrip"
      : "oneway";

  return {
    origin,
    destination,
    departDate,
    returnDate,
    adults,
    cabin: cabinValues.includes(cabin as CabinClass) ? (cabin as CabinClass) : "",
    tripType,
  };
}

export function buildSearchParams(state: SearchFormState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.origin) {
    params.set("origin", state.origin);
  }
  if (state.destination) {
    params.set("destination", state.destination);
  }
  if (state.departDate) {
    params.set("departDate", state.departDate);
  }
  if (state.tripType === "roundtrip" && state.returnDate) {
    params.set("returnDate", state.returnDate);
  }
  params.set("adults", state.adults.toString());

  if (state.cabin) {
    params.set("cabin", state.cabin);
  }

  params.set("trip", state.tripType === "roundtrip" ? "rt" : "ow");

  return params;
}

export function searchKeyFromState(state: SearchFormState): string {
  return [
    state.origin,
    state.destination,
    state.departDate,
    state.returnDate,
    state.adults.toString(),
    state.cabin,
    state.tripType,
  ].join("|");
}

export function isSearchReady(state: SearchFormState): boolean {
  if (!state.origin || !state.destination || !state.departDate) {
    return false;
  }

  if (state.tripType === "roundtrip" && !state.returnDate) {
    return false;
  }

  return true;
}

