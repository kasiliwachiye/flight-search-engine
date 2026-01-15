import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      error: "Price trend is derived from flight offers in the client.",
    },
    { status: 501 }
  );
}

