import type { FlightOffer, FlightOffersResponse } from "@/domain/types";
import type { AmadeusFlightOffersResponse } from "@/domain/amadeus";
import { parseIsoDurationToMinutes } from "@/lib/time";

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapFlightOffers(
  response: AmadeusFlightOffersResponse
): FlightOffersResponse {
  const carriers = response.dictionaries?.carriers ?? {};

  const offers: FlightOffer[] = response.data.map((offer) => {
    const itineraryData = offer.itineraries.map((itinerary) => {
      const segments = itinerary.segments.map((segment, index) => ({
        id: segment.id ?? `${offer.id}-${index}-${segment.carrierCode}`,
        carrierCode: segment.carrierCode,
        number: segment.number,
        departure: {
          iataCode: segment.departure.iataCode,
          at: segment.departure.at,
        },
        arrival: {
          iataCode: segment.arrival.iataCode,
          at: segment.arrival.at,
        },
        durationMinutes: parseIsoDurationToMinutes(segment.duration),
        stops: segment.numberOfStops ?? 0,
      }));

      return {
        durationMinutes: parseIsoDurationToMinutes(itinerary.duration),
        segments,
      };
    });

    const stopCounts = itineraryData.map((itinerary) =>
      Math.max(0, itinerary.segments.length - 1)
    );
    const stopsCount = stopCounts.length ? Math.max(...stopCounts) : 0;

    const airlinesSet = new Set<string>();
    offer.validatingAirlineCodes?.forEach((code) => airlinesSet.add(code));
    itineraryData.forEach((itinerary) => {
      itinerary.segments.forEach((segment) => airlinesSet.add(segment.carrierCode));
    });

    return {
      id: offer.id,
      price: {
        total: toNumber(offer.price.total),
        currency: offer.price.currency,
      },
      itineraries: itineraryData,
      stopsCount,
      airlines: Array.from(airlinesSet).sort(),
    };
  });

  return { offers, carriers };
}

