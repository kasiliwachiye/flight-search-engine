import { NextResponse } from "next/server";
import { z } from "zod";
import { amadeusFlightOffersResponseSchema } from "@/domain/amadeus";
import { mapFlightOffers } from "@/domain/mappers";
import { amadeusFetch } from "@/lib/amadeus";

const querySchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.coerce.number().int().min(1).max(9),
  cabin: z
    .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
    .optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    origin: searchParams.get("origin")?.toUpperCase(),
    destination: searchParams.get("destination")?.toUpperCase(),
    departDate: searchParams.get("departDate"),
    returnDate: searchParams.get("returnDate") ?? undefined,
    adults: searchParams.get("adults"),
    cabin: searchParams.get("cabin") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "Invalid search parameters",
        issues: parsedQuery.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { origin, destination, departDate, returnDate, adults, cabin } =
    parsedQuery.data;

  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departDate,
    adults: adults.toString(),
    max: "50",
  });

  if (returnDate) {
    params.set("returnDate", returnDate);
  }

  if (cabin) {
    params.set("travelClass", cabin);
  }

  try {
    const response = await amadeusFetch(
      `/v2/shopping/flight-offers?${params.toString()}`
    );
    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: payload?.errors?.[0]?.detail ?? "Unable to fetch flights",
        },
        { status: response.status }
      );
    }

    const parsed = amadeusFlightOffersResponseSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Unexpected response from Amadeus" },
        { status: 502 }
      );
    }

    const normalized = mapFlightOffers(parsed.data);
    return NextResponse.json(normalized);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch flights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

