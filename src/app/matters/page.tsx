"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";

const RISK_TONE: Record<string, "green" | "amber" | "red"> = { on_track: "green", attention: "amber", at_risk: "red" };

export default function MattersPage() {
  const { matters, clients, team } = useAppState();
  const [category, setCategory] = useState("all");
  const [lawyer, setLawyer] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => matters.filter((m) => {
    if (category !== "all" && m.category !== category) return false;
    if (lawyer !== "all" && m.responsibleLawyerId !== lawyer) return false;
    if (status !== "all" && m.status !== status) return false;
    return true;
  }), [matters, category, lawyer, status]);

  function clientName(id: string) { return clients.find((c) => c.id === id)?.fullName ?? "Unknown"; }
  function lawyerName(id: string) { return team.find((t) => t.id === id)?.fullName ?? "Unassigned"; }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Current Cases" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-graphite-900">Current Cases</h1>
          <Link href="/referrals"><Button variant="outline">Convert a new referral</Button></Link>
        </div>

        <Card>
          <div className="grid sm:grid-cols-3 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All practice areas</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="employment">Employment Law</option>
            </select>
            <select value={lawyer} onChange={(e) => setLawyer(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All responsible lawyers</option>
              {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All matter statuses</option>
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState title="No matters match these filters" description="Convert an accepted referral to create your first matter." />
        ) : (
          <Card className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matter #</th><th>Client</th><th>Matter name</th><th>Practice area</th><th>Responsible lawyer</th>
                  <th>Stage</th><th>Open date</th><th>Next deadline</th><th>Last activity</th><th>Risk</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td><Link href={`/matters/${m.id}`} className="text-teal-700 hover:underline font-medium">{m.matterNumber}</Link></td>
                    <td>{clientName(m.clientId)}</td>
                    <td>{m.matterName}</td>
                    <td>{m.practiceArea}</td>
                    <td>{lawyerName(m.responsibleLawyerId)}</td>
                    <td><Badge tone="gray">{m.stage}</Badge></td>
                    <td>{m.openDate}</td>
                    <td>{m.nextDeadline ?? "—"}</td>
                    <td>{new Date(m.lastActivityAt).toLocaleDateString()}</td>
                    <td><Badge tone={RISK_TONE[m.riskStatus]}>{m.riskStatus.replace(/_/g, " ")}</Badge></td>
                    <td><Badge tone={m.status === "active" ? "teal" : m.status === "closed" ? "gray" : "amber"}>{m.status.replace(/_/g, " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
