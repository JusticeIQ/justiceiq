"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, InfoBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";

const SECTIONS = [
  "Firm profile", "Users and roles", "Practice areas", "Jurisdictions", "Referral criteria", "Notification rules",
  "Conflict-check settings", "Document categories", "Matter numbering", "Workflow templates", "Branding",
  "Client portal", "Privacy", "Security", "Subscription", "Integrations",
];

export default function SettingsPage() {
  const { firm, team } = useAppState();
  const [active, setActive] = useState(SECTIONS[0]);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Settings" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Settings</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 p-2">
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => setActive(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm focus-ring ${active === s ? "bg-teal-50 text-teal-700 font-medium" : "text-graphite-600 hover:bg-graphite-50"}`}>
                  {s}
                </button>
              ))}
            </nav>
          </Card>

          <Card className="lg:col-span-3">
            <h2 className="font-semibold text-graphite-900 mb-4">{active}</h2>

            {active === "Firm profile" && (
              <div className="space-y-3 text-sm">
                <div><p className="text-xs text-graphite-500">Firm name</p><p className="text-graphite-900">{firm?.name}</p></div>
                <div><p className="text-xs text-graphite-500">Firm size</p><p className="text-graphite-900">{firm?.firmSize}</p></div>
                <div><p className="text-xs text-graphite-500">Offices</p><ul className="text-graphite-900">{firm?.offices.map((o) => <li key={o.id}>{o.name} — {o.address}</li>)}</ul></div>
              </div>
            )}
            {active === "Users and roles" && (
              <ul className="text-sm text-graphite-900 space-y-1.5">{team.map((t) => <li key={t.id} className="flex justify-between"><span>{t.fullName}</span><Badge tone="gray">{t.title}</Badge></li>)}</ul>
            )}
            {active === "Practice areas" && (
              <div className="flex gap-2">{firm?.practiceAreas.map((p) => <Badge key={p} tone="teal">{p === "personal_injury" ? "Personal Injury" : "Employment Law"}</Badge>)}</div>
            )}
            {active === "Jurisdictions" && (
              <div className="flex gap-2">{firm?.jurisdictions.map((j) => <Badge key={j} tone="gray">{j}</Badge>)}</div>
            )}
            {active === "Referral criteria" && (
              <p className="text-sm text-graphite-900">{firm?.minimumCaseCriteria}</p>
            )}
            {active === "Notification rules" && (
              <ul className="text-sm text-graphite-900 list-disc list-inside space-y-1">{firm?.notificationPreferences.map((n) => <li key={n}>{n}</li>)}</ul>
            )}
            {active === "Conflict-check settings" && (
              <div className="space-y-2">
                <p className="text-sm text-graphite-900">{firm?.conflictScreeningProcedure}</p>
                <InfoBanner tone="amber">The in-app conflict check is a simulated screening aid and does not replace the firm's formal conflict-check procedure.</InfoBanner>
              </div>
            )}
            {active === "Document categories" && (
              <div className="flex flex-wrap gap-2">{["Intake", "Correspondence", "Medical", "Employment Records", "Pleadings", "Discovery", "Expert Reports", "Damages", "Settlement", "Internal Work Product"].map((c) => <Badge key={c} tone="gray">{c}</Badge>)}</div>
            )}
            {active === "Matter numbering" && (
              <p className="text-sm text-graphite-900">Format: <code className="bg-graphite-100 px-1.5 py-0.5 rounded">[PI|EMP]-[YEAR]-[SEQUENCE]</code>, e.g. PI-2026-0142</p>
            )}
            {active === "Workflow templates" && (
              <p className="text-sm text-graphite-900">Manage reusable task templates (New personal injury file, New employment file, Initial consultation, Demand package, Pleadings preparation, Discovery preparation, Mediation preparation, File closing) from Settings → Workflow Templates in production. See lib/demo-data.ts (TASK_TEMPLATES) for the seeded set.</p>
            )}
            {active === "Branding" && (
              <p className="text-sm text-graphite-900">Firm logo, color accents, and client-portal branding — configurable in production.</p>
            )}
            {active === "Client portal" && (
              <p className="text-sm text-graphite-900">Client portal is enabled for this firm. Clients can view shared documents, complete requested tasks, and send secure messages.</p>
            )}
            {active === "Privacy" && (
              <p className="text-sm text-graphite-900">Data is private to your firm by default. See docs/SECURITY.md for the full privacy and data-handling model.</p>
            )}
            {active === "Security" && (
              <ul className="text-sm text-graphite-900 list-disc list-inside space-y-1">
                <li>Role-based access control</li>
                <li>Row-level security (production, via Supabase)</li>
                <li>Multi-factor authentication (planned)</li>
                <li>Session timeout controls</li>
              </ul>
            )}
            {active === "Subscription" && <p className="text-sm text-graphite-900">Current plan: {firm?.subscriptionTier?.toUpperCase()}. Manage from the Subscription page.</p>}
            {active === "Integrations" && <p className="text-sm text-graphite-900">Manage connected tools from the Integrations page.</p>}

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-graphite-100">
              <Button size="sm" onClick={save}>Save changes</Button>
              {saved && <span className="text-xs text-teal-700">Saved (simulated)</span>}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
