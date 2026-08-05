"use client";

import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, InfoBanner } from "@/components/ui";

const INTEGRATIONS = [
  { name: "Microsoft Outlook", category: "Email & Calendar", status: "Planned" },
  { name: "Google Calendar", category: "Calendar", status: "Planned" },
  { name: "Gmail", category: "Email", status: "Planned" },
  { name: "Microsoft 365", category: "Productivity", status: "Planned" },
  { name: "DocuSign", category: "E-signature", status: "Planned" },
  { name: "LawPay", category: "Payments & Trust Accounting", status: "Planned" },
  { name: "QuickBooks", category: "Accounting", status: "Planned" },
  { name: "Clio", category: "Practice Management", status: "Planned" },
  { name: "PracticePanther", category: "Practice Management", status: "Planned" },
  { name: "Filevine", category: "Case Management", status: "Planned" },
  { name: "Litify", category: "Case Management", status: "Planned" },
  { name: "Cloud storage (Box, Dropbox, OneDrive)", category: "Document Storage", status: "Planned" },
  { name: "Court-calendar services", category: "Deadlines", status: "Planned" },
];

export default function IntegrationsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Integrations" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Integrations</h1>
        <InfoBanner tone="gray">
          The integrations below are demonstration placeholders for a future release. None are functional in this MVP —
          JusticeIQ's only live connection today is the JusticeChamp Consumer Intake referral pipeline (see
          docs/INTEGRATION_SPEC.md).
        </InfoBanner>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((i) => (
            <Card key={i.name}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-graphite-900 text-sm">{i.name}</p>
                  <p className="text-xs text-graphite-500 mt-1">{i.category}</p>
                </div>
                <Badge tone="amber">{i.status}</Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3" disabled>Connect (coming soon)</Button>
            </Card>
          ))}
          <Card className="border-teal-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-graphite-900 text-sm">JusticeChamp™ Consumer Intake</p>
                <p className="text-xs text-graphite-500 mt-1">Referral pipeline</p>
              </div>
              <Badge tone="green">Connected (demo)</Badge>
            </div>
            <p className="text-xs text-graphite-500 mt-3">Referrals, claim summaries, and readiness scores flow in automatically. See the Referrals page.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
