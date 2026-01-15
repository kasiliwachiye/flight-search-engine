import { NextResponse } from "next/server";
import { getAmadeusAccessToken } from "@/lib/amadeus";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accessToken = await getAmadeusAccessToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch access token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
