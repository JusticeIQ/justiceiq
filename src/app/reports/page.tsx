"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Button, Badge } from "@/components/ui";
import { ReferralStatusBadge } from "@/components/StatusBadges";
import { useAppState } from "@/lib/store";

const REPORTS = [
  { id: "referrals", label: "Referral Report", description: "All referrals with status, score, and assigned lawyer." },
  { id: "matters", label: "Matter Status Report", description: "All matters with stage, deadlines, and risk status." },
  { id: "deadlines", label: "Deadline Report", description: "All upcoming deadlines across active matters." },
  { id: "tasks", label: "Task Report", description: "All open and overdue tasks by assignee." },
];

export default function ReportsPage() {
  const { referrals, matters, tasks } = useAppState();
  const [active, setActive] = useState("referrals");
  const [exported, setExported] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Reports" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Reports</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORTS.map((r) => (
            <Card key={r.id} className={`cursor-pointer transition-colors ${active === r.id ? "border-teal-400" : ""}`} >
              <button className="text-left w-full" onClick={() => setActive(r.id)}>
                <p className="text-sm font-semibold text-graphite-900">{r.label}</p>
                <p className="text-xs text-graphite-500 mt-1">{r.description}</p>
              </button>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-graphite-900 text-sm">{REPORTS.find((r) => r.id === active)?.label}</h2>
            <Button size="sm" variant="outline" onClick={() => setExported(active)}>Export CSV</Button>
          </div>
          {exported === active && <p className="text-xs text-teal-700 mb-3">Export generated (simulated) — in production this downloads a CSV file.</p>}

          {active === "referrals" && (
            <table className="data-table">
              <thead><tr><th>Consumer</th><th>Type</th><th>Score</th><th>Status</th></tr></thead>
              <tbody>{referrals.map((r) => <tr key={r.id}><td>{r.consumerAnonymizedId}</td><td>{r.subtype}</td><td>{r.assessment.claimReadiness}</td><td><ReferralStatusBadge status={r.status} /></td></tr>)}</tbody>
            </table>
          )}
          {active === "matters" && (
            <table className="data-table">
              <thead><tr><th>Matter #</th><th>Name</th><th>Stage</th><th>Risk</th></tr></thead>
              <tbody>{matters.map((m) => <tr key={m.id}><td>{m.matterNumber}</td><td>{m.matterName}</td><td>{m.stage}</td><td><Badge tone={m.riskStatus === "on_track" ? "green" : m.riskStatus === "attention" ? "amber" : "red"}>{m.riskStatus.replace(/_/g, " ")}</Badge></td></tr>)}</tbody>
            </table>
          )}
          {active === "deadlines" && (
            <table className="data-table">
              <thead><tr><th>Matter</th><th>Deadline</th><th>Date</th></tr></thead>
              <tbody>{matters.filter((m) => m.nextDeadline).map((m) => <tr key={m.id}><td>{m.matterName}</td><td>{m.nextDeadlineLabel}</td><td>{m.nextDeadline}</td></tr>)}</tbody>
            </table>
          )}
          {active === "tasks" && (
            <table className="data-table">
              <thead><tr><th>Task</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>{tasks.map((t) => <tr key={t.id}><td>{t.title}</td><td>{t.dueDate}</td><td>{t.status.replace(/_/g, " ")}</td></tr>)}</tbody>
            </table>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
