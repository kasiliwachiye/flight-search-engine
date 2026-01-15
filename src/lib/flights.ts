import type { FlightOffersResponse } from "@/domain/types";
import type { SearchFormState } from "@/state/urlState";

export function buildFlightsQuery(state: SearchFormState): string {
  const params = new URLSearchParams();

  if (state.origin) {
    params.set("origin", state.origin.trim().toUpperCase());
  }
  if (state.destination) {
    params.set("destination", state.destination.trim().toUpperCase());
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

  return params.toString();
}

export async function fetchFlights(
  state: SearchFormState
): Promise<FlightOffersResponse> {
  const query = buildFlightsQuery(state);
  const response = await fetch(`/api/flights?${query}`);

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Unable to fetch flights");
  }

  return (await response.json()) as FlightOffersResponse;
}

