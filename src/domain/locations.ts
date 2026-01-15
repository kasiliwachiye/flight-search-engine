import type { AmadeusLocationsResponse } from "@/domain/amadeus";
import type { LocationOption } from "@/domain/types";

export function mapLocations(response: AmadeusLocationsResponse): LocationOption[] {
  return response.data
    .map((item) => {
      const city = item.address?.cityName ?? item.name;
      const country = item.address?.countryName ?? "";

      return {
        iata: item.iataCode,
        name: item.name,
        city,
        country,
        countryCode: item.address?.countryCode,
        subType: item.subType,
      } satisfies LocationOption;
    })
    .filter((item) => item.iata && item.city);
}

