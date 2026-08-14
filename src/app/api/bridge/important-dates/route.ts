import { NextRequest, NextResponse } from "next/server";

// Server-to-server proxy: relays a shared / updated / cancelled case-calendar
// date from SolonIQ to JusticeChamp's Important Dates calendar. Only
// called after a lawyer explicitly chooses to share (or sync) a date.
const WEBHOOK_SECRET = process.env.JUSTICECHAMP_WEBHOOK_SECRET || "demo-shared-secret-justiceiq-justicechamp";
const JUSTICECHAMP_URL = process.env.NEXT_PUBLIC_JUSTICECHAMP_APP_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, deliveryStatus: "failed", error: "Invalid request body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${JUSTICECHAMP_URL}/api/bridge/important-dates`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-webhook-secret": WEBHOOK_SECRET },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, deliveryStatus: "failed", error: `JusticeChamp responded ${res.status}: ${text.slice(0, 200)}` },
        { status: 200 }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, deliveryStatus: "sent", dateId: data.id });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        deliveryStatus: "failed",
        error:
          err instanceof Error
            ? `Could not reach JusticeChamp at ${JUSTICECHAMP_URL} (${err.message}). Is the JusticeChamp dev server running?`
            : "Could not reach JusticeChamp.",
      },
      { status: 200 }
    );
  }
}
