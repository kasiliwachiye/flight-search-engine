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

function safeJsonParse(text: string): unknown | null {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    const errors = record.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0] as Record<string, unknown>;
      const detail = typeof first.detail === "string" ? first.detail : undefined;
      const title = typeof first.title === "string" ? first.title : undefined;
      return detail ?? title ?? fallback;
    }
    const error = record.error;
    if (typeof error === "string") {
      return error;
    }
  }

  return fallback;
}

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
    const rawText = await response.text();
    const payload = safeJsonParse(rawText);

    if (!response.ok) {
      const message = extractErrorMessage(
        payload,
        response.status === 429
          ? "Rate limit reached. Please try again shortly."
          : "Unable to fetch flights"
      );
      return NextResponse.json({ error: message }, { status: response.status });
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

