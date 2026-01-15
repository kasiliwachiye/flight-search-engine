import type { LocationOption } from "@/domain/types";
import { searchAirports } from "@/lib/airports";

export async function searchLocations(keyword: string): Promise<LocationOption[]> {
  const trimmed = keyword.trim();
  if (trimmed.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/locations?keyword=${encodeURIComponent(trimmed)}`
    );
    if (!response.ok) {
      throw new Error("Location lookup failed");
    }

    const payload = (await response.json()) as { locations?: LocationOption[] };
    if (payload.locations && payload.locations.length > 0) {
      return payload.locations;
    }
  } catch {
    // Fall through to local dataset.
  }

  return searchAirports(trimmed);
}

