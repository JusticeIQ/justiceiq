"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { ReferralStatusBadge, REFERRAL_STATUSES, UrgencyBadge } from "@/components/StatusBadges";
import { useAppState } from "@/lib/store";
import { ReferralStatus } from "@/lib/types";

type SortKey = "score" | "date" | "deadline";

export default function ReferralsPage() {
  const { referrals, team } = useAppState();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [category, setCategory] = useState<string>("all");
  const [jurisdiction, setJurisdiction] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [urgency, setUrgency] = useState<string>("all");
  const [assignedLawyer, setAssignedLawyer] = useState<string>("all");
  const [minScore, setMinScore] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const jurisdictions = Array.from(new Set(referrals.map((r) => r.jurisdiction)));

  const filtered = useMemo(() => {
    let list = referrals.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (jurisdiction !== "all" && r.jurisdiction !== jurisdiction) return false;
      if (status !== "all" && r.status !== status) return false;
      if (urgency !== "all" && r.assessment.urgency !== urgency) return false;
      if (assignedLawyer !== "all" && r.assignedLawyerId !== assignedLawyer) return false;
      if (r.assessment.claimReadiness < minScore) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === "score") return b.assessment.claimReadiness - a.assessment.claimReadiness;
      if (sortKey === "deadline") return a.responseDeadline.localeCompare(b.responseDeadline);
      return b.submittedAt.localeCompare(a.submittedAt);
    });
    return list;
  }, [referrals, category, jurisdiction, status, urgency, assignedLawyer, minScore, sortKey]);

  function lawyerName(id: string | null) {
    if (!id) return "Unassigned";
    return team.find((t) => t.id === id)?.fullName ?? "Unknown";
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "New Referrals" }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-graphite-900">Referral Pipeline</h1>
          <div className="flex gap-2">
            <Button variant={view === "table" ? "primary" : "outline"} size="sm" onClick={() => setView("table")}>Table view</Button>
            <Button variant={view === "kanban" ? "primary" : "outline"} size="sm" onClick={() => setView("kanban")}>Kanban view</Button>
          </div>
        </div>

        <Card>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All practice areas</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="employment">Employment Law</option>
            </select>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All jurisdictions</option>
              {jurisdictions.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All statuses</option>
              {REFERRAL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All urgency levels</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
            <select value={assignedLawyer} onChange={(e) => setAssignedLawyer(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All lawyers</option>
              {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="date">Sort by referral date</option>
              <option value="score">Sort by readiness score</option>
              <option value="deadline">Sort by response deadline</option>
            </select>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <label className="text-xs text-graphite-500">Minimum score: {minScore}</label>
            <input type="range" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="flex-1 max-w-xs" />
          </div>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState title="No referrals match these filters" description="Try widening your filters to see more of the pipeline." />
        ) : view === "table" ? (
          <Card className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Consumer</th><th>Claim type</th><th>Jurisdiction</th><th>Incident date</th><th>Score</th>
                  <th>Evidence</th><th>Urgency</th><th>Referral date</th><th>Assigned lawyer</th><th>Status</th><th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td><Link href={`/referrals/${r.id}`} className="text-teal-700 hover:underline font-medium">{r.consumerAnonymizedId}</Link></td>
                    <td>{r.subtype}<div className="text-[11px] text-graphite-400">{r.category === "personal_injury" ? "Personal Injury" : "Employment Law"}</div></td>
                    <td>{r.jurisdiction}</td>
                    <td>{r.incidentDate}</td>
                    <td className="font-medium">{r.assessment.claimReadiness}</td>
                    <td>{r.assessment.evidenceStrength}%</td>
                    <td><UrgencyBadge level={r.assessment.urgency} /></td>
                    <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td>{lawyerName(r.assignedLawyerId)}</td>
                    <td><ReferralStatusBadge status={r.status} /></td>
                    <td>{new Date(r.responseDeadline).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {REFERRAL_STATUSES.map((s) => (
              <div key={s} className="w-72 shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold text-graphite-600 uppercase tracking-wide">{s.replace(/_/g, " ")}</p>
                  <Badge tone="gray">{filtered.filter((r) => r.status === s).length}</Badge>
                </div>
                <div className="space-y-2">
                  {filtered.filter((r) => r.status === s).map((r) => (
                    <Link key={r.id} href={`/referrals/${r.id}`}>
                      <Card className="hover:border-teal-300 border border-transparent transition-colors">
                        <p className="text-sm font-medium text-graphite-900">{r.consumerAnonymizedId}</p>
                        <p className="text-xs text-graphite-500">{r.subtype}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge tone="teal">{r.assessment.claimReadiness}</Badge>
                          <UrgencyBadge level={r.assessment.urgency} />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
