import { NextResponse } from "next/server";
import { z } from "zod";
import { amadeusLocationsResponseSchema } from "@/domain/amadeus";
import { mapLocations } from "@/domain/locations";
import { amadeusFetch } from "@/lib/amadeus";

const querySchema = z.object({
  keyword: z.string().min(2),
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
    keyword: searchParams.get("keyword")?.trim(),
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Keyword must be at least 2 characters" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    keyword: parsedQuery.data.keyword,
    subType: "AIRPORT,CITY",
    view: "LIGHT",
  });
  params.set("page[limit]", "12");

  try {
    const response = await amadeusFetch(
      `/v1/reference-data/locations?${params.toString()}`
    );
    const rawText = await response.text();
    const payload = safeJsonParse(rawText);

    if (!response.ok) {
      const message = extractErrorMessage(
        payload,
        response.status === 429
          ? "Rate limit reached. Please try again shortly."
          : "Unable to fetch locations"
      );
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const parsed = amadeusLocationsResponseSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Unexpected response from Amadeus" },
        { status: 502 }
      );
    }

    return NextResponse.json({ locations: mapLocations(parsed.data) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch locations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

