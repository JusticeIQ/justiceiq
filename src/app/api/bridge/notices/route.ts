import { NextRequest, NextResponse } from "next/server";

// Server-to-server proxy: relays an approved client update from SolonIQ to
// JusticeChamp's Notices inbox. This route only runs after a lawyer has
// explicitly clicked "Send to Client" in the review screen — nothing here
// runs automatically. See docs/INTEGRATION_SPEC.md.
//
// The shared secret and target URL fall back to demo-friendly defaults so
// the bridge works out of the box on localhost without any .env setup; set
// JUSTICECHAMP_WEBHOOK_SECRET / NEXT_PUBLIC_JUSTICECHAMP_APP_URL to override.
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
    const res = await fetch(`${JUSTICECHAMP_URL}/api/bridge/notices`, {
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
    return NextResponse.json({ ok: true, deliveryStatus: "sent", noticeId: data.id });
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
