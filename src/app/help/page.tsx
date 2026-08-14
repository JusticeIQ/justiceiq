"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button } from "@/components/ui";

const FAQS = [
  { q: "How do referrals get into SolonIQ?", a: "Referrals arrive automatically from JusticeChamp Consumer Intake when a consumer's claim is matched to your firm, or can be added manually in a future release." },
  { q: "Does the claim-readiness score replace my own evaluation?", a: "No. It's preliminary intake analysis from JusticeChamp, intended to help you triage — not a substitute for your own review, conflict check, and professional judgment." },
  { q: "Is the conflict check a substitute for our formal procedure?", a: "No. It's a simulated screening aid in this MVP and should never replace your firm's formal conflict-of-interest process." },
  { q: "Can clients see everything in a matter?", a: "No. Documents and notes are labeled client-visible or internal-only, and only client-visible items are shown through the client portal connection." },
  { q: "Will emails and messages actually send?", a: "Not in this MVP. Communications are recorded in a demo delivery log rather than sent through a real email/SMS provider." },
];

export default function HelpPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Help" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Help Center</h1>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-semibold text-graphite-900">Guided demo tour</p>
            <p className="text-xs text-graphite-500 mt-1">Step-by-step walkthrough for presentations.</p>
            <Link href="/demo"><Button size="sm" variant="outline" className="mt-3">Open demo tour</Button></Link>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-graphite-900">Contact support</p>
            <p className="text-xs text-graphite-500 mt-1">support@justiceiq.example (simulated for this demo).</p>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="text-sm font-medium text-graphite-900">{f.q}</p>
                <p className="text-sm text-graphite-500 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <Badge tone="amber">Professional responsibility notice</Badge>
          <p className="text-sm text-amber-900 mt-2">
            SolonIQ is a technology platform for organizing referrals and matters. It does not perform legal analysis on
            your behalf, does not replace your firm's conflict-check or ethics procedures, and does not guarantee any
            outcome. See docs/SECURITY.md for the pre-production compliance checklist.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
