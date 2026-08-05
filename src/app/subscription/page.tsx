"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, InfoBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { SUBSCRIPTION_TIERS } from "@/lib/demo-data";

export default function SubscriptionPage() {
  const { firm } = useAppState();
  const [upgraded, setUpgraded] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Subscription" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Subscription Plans</h1>
        <InfoBanner tone="gray">Pricing and limits below are illustrative and fully configurable for launch.</InfoBanner>

        <div className="grid md:grid-cols-5 gap-4">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isCurrent = firm?.subscriptionTier === tier.id;
            return (
              <Card key={tier.id} className={isCurrent ? "border-teal-400 border-2" : ""}>
                {isCurrent && <Badge tone="teal">Current plan</Badge>}
                <h2 className="text-lg font-bold text-graphite-900 mt-2">{tier.name}</h2>
                <p className="text-2xl font-bold text-graphite-900 mt-1">{tier.monthlyPrice === 0 ? "Free" : `$${tier.monthlyPrice}`}<span className="text-xs font-normal text-graphite-500">{tier.monthlyPrice > 0 && "/mo"}</span></p>
                <ul className="mt-4 space-y-1.5 text-xs text-graphite-600">
                  <li>Users: {tier.users}</li>
                  <li>Referrals: {tier.referrals}</li>
                  <li>Active matters: {tier.activeMatters}</li>
                  <li>Storage: {tier.storage}</li>
                  <li>{tier.aiAssistance ? "✓" : "—"} AI-assisted analysis</li>
                  <li>{tier.workflowAutomation ? "✓" : "—"} Workflow automation</li>
                  <li>{tier.advancedReporting ? "✓" : "—"} Advanced reporting</li>
                  <li>{tier.integrations ? "✓" : "—"} Integrations</li>
                  <li>{tier.multiOffice ? "✓" : "—"} Multi-office</li>
                  <li>{tier.customIntakeCriteria ? "✓" : "—"} Custom intake criteria</li>
                  <li>{tier.businessIntelligence ? "✓" : "—"} Business intelligence</li>
                  <li>Support: {tier.support}</li>
                </ul>
                <Button
                  size="sm" className="w-full mt-4" variant={isCurrent ? "outline" : "secondary"} disabled={isCurrent}
                  onClick={() => setUpgraded(tier.id)}
                >
                  {isCurrent ? "Current plan" : "Upgrade to " + tier.name}
                </Button>
              </Card>
            );
          })}
        </div>
        {upgraded && (
          <InfoBanner tone="teal">
            Plan change to {SUBSCRIPTION_TIERS.find((t) => t.id === upgraded)?.name} simulated for this demo. In production
            this would route to a billing confirmation flow.
          </InfoBanner>
        )}
      </div>
    </AppShell>
  );
}
