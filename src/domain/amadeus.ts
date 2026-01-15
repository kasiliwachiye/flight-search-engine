import { z } from "zod";

export const amadeusTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string().optional(),
});

export const amadeusSegmentSchema = z.object({
  id: z.string().optional(),
  carrierCode: z.string(),
  number: z.string(),
  departure: z.object({
    iataCode: z.string(),
    at: z.string(),
  }),
  arrival: z.object({
    iataCode: z.string(),
    at: z.string(),
  }),
  duration: z.string(),
  numberOfStops: z.number().optional(),
});

export const amadeusItinerarySchema = z.object({
  duration: z.string(),
  segments: z.array(amadeusSegmentSchema),
});

export const amadeusOfferSchema = z.object({
  id: z.string(),
  price: z.object({
    total: z.string(),
    currency: z.string(),
  }),
  itineraries: z.array(amadeusItinerarySchema),
  validatingAirlineCodes: z.array(z.string()).optional(),
});

export const amadeusFlightOffersResponseSchema = z.object({
  data: z.array(amadeusOfferSchema),
  dictionaries: z
    .object({
      carriers: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
});

export const amadeusLocationSchema = z.object({
  iataCode: z.string(),
  name: z.string(),
  subType: z.enum(["AIRPORT", "CITY"]),
  address: z
    .object({
      cityName: z.string().optional(),
      countryName: z.string().optional(),
      countryCode: z.string().optional(),
    })
    .optional(),
});

export const amadeusLocationsResponseSchema = z.object({
  data: z.array(amadeusLocationSchema),
});

export type AmadeusTokenResponse = z.infer<typeof amadeusTokenSchema>;
export type AmadeusFlightOffersResponse = z.infer<
  typeof amadeusFlightOffersResponseSchema
>;
export type AmadeusLocationsResponse = z.infer<
  typeof amadeusLocationsResponseSchema
>;

