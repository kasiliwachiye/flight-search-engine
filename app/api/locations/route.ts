import { NextResponse } from "next/server";
import { z } from "zod";
import { amadeusLocationsResponseSchema } from "@/domain/amadeus";
import { mapLocations } from "@/domain/locations";
import { amadeusFetch } from "@/lib/amadeus";

const querySchema = z.object({
  keyword: z.string().min(2),
});

export const dynamic = "force-dynamic";

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
    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.errors?.[0]?.detail ?? "Unable to fetch locations" },
        { status: response.status }
      );
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

