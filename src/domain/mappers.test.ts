import { describe, expect, it } from "vitest";
import type { AmadeusFlightOffersResponse } from "@/domain/amadeus";
import { mapFlightOffers } from "@/domain/mappers";

describe("mapFlightOffers", () => {
  it("normalizes offers and carriers", () => {
    const response: AmadeusFlightOffersResponse = {
      data: [
        {
          id: "1",
          price: { total: "123.45", currency: "USD" },
          itineraries: [
            {
              duration: "PT6H",
              segments: [
                {
                  carrierCode: "AA",
                  number: "100",
                  departure: { iataCode: "JFK", at: "2026-01-01T08:00:00" },
                  arrival: { iataCode: "LAX", at: "2026-01-01T11:00:00" },
                  duration: "PT6H",
                  numberOfStops: 0,
                },
                {
                  carrierCode: "AA",
                  number: "200",
                  departure: { iataCode: "LAX", at: "2026-01-01T12:00:00" },
                  arrival: { iataCode: "SFO", at: "2026-01-01T13:30:00" },
                  duration: "PT1H30M",
                  numberOfStops: 0,
                },
              ],
            },
          ],
          validatingAirlineCodes: ["AA"],
        },
      ],
      dictionaries: {
        carriers: {
          AA: "American Airlines",
        },
      },
    };

    const mapped = mapFlightOffers(response);

    expect(mapped.offers).toHaveLength(1);
    expect(mapped.offers[0].price.total).toBeCloseTo(123.45);
    expect(mapped.offers[0].stopsCount).toBe(1);
    expect(mapped.offers[0].airlines).toEqual(["AA"]);
    expect(mapped.offers[0].itineraries[0].durationMinutes).toBe(360);
    expect(mapped.carriers.AA).toBe("American Airlines");
  });
});
