"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, StatCard, MiniBarChart, MiniLineChart, Badge } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function AnalyticsPage() {
  const { referrals, matters, tasks, team } = useAppState();
  const [dateRange, setDateRange] = useState("last_90_days");
  const [practiceArea, setPracticeArea] = useState("all");

  const scoped = referrals.filter((r) => practiceArea === "all" || r.category === practiceArea);

  const byPracticeArea = [
    { label: "Personal Injury", value: referrals.filter((r) => r.category === "personal_injury").length },
    { label: "Employment", value: referrals.filter((r) => r.category === "employment").length },
  ];
  const byJurisdiction = Array.from(new Set(referrals.map((r) => r.jurisdiction))).map((j) => ({ label: j, value: referrals.filter((r) => r.jurisdiction === j).length }));
  const avgScore = Math.round(scoped.reduce((s, r) => s + r.assessment.claimReadiness, 0) / (scoped.length || 1));
  const accepted = referrals.filter((r) => r.status === "accepted" || r.status === "converted").length;
  const declined = referrals.filter((r) => r.status === "declined").length;
  const acceptanceRate = Math.round((accepted / (accepted + declined || 1)) * 100);
  const consultationCount = referrals.filter((r) => r.consultation).length;
  const referralToConsultRate = Math.round((consultationCount / (referrals.length || 1)) * 100);
  const retainedCount = referrals.filter((r) => r.consultation?.outcome === "retained").length;
  const consultToRetainRate = Math.round((retainedCount / (consultationCount || 1)) * 100);

  const declineReasons = ["Outside jurisdiction", "Outside practice area", "Conflict", "Insufficient capacity", "Claim does not meet firm criteria", "Other"].map((reason) => ({
    label: reason.replace("Outside ", "").replace("Claim does not meet firm criteria", "Criteria"), value: referrals.filter((r) => r.declineReason === reason).length,
  }));

  const casesByStage = Array.from(new Set(matters.map((m) => m.stage))).map((s) => ({ label: s, value: matters.filter((m) => m.stage === s).length }));
  const overdueTasks = tasks.filter((t) => t.status !== "complete" && t.status !== "cancelled" && t.dueDate < "2026-08-04").length;
  const workload = team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => ({ label: t.fullName.split(" ")[0], value: matters.filter((m) => m.responsibleLawyerId === t.id && m.status === "active").length }));

  const funnel = [
    { label: "Consumer reports", value: referrals.length + 6 },
    { label: "Referrals sent", value: referrals.length },
    { label: "Consultations", value: consultationCount },
    { label: "Retained", value: retainedCount },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Analytics" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Firm Analytics</h1>

        <Card>
          <div className="grid sm:grid-cols-4 gap-3">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>
            <select value={practiceArea} onChange={(e) => setPracticeArea(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All practice areas</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="employment">Employment Law</option>
            </select>
            <select className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" defaultValue="all">
              <option value="all">All offices</option>
              <option value="sf">San Francisco HQ</option>
              <option value="oak">Oakland Satellite</option>
            </select>
            <select className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" defaultValue="all">
              <option value="all">All lawyers</option>
              {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Average claim-readiness score" value={avgScore} />
          <StatCard label="Referral acceptance rate" value={`${acceptanceRate}%`} tone="up" />
          <StatCard label="Referral-to-consultation rate" value={`${referralToConsultRate}%`} />
          <StatCard label="Consultation-to-retainer rate" value={`${consultToRetainRate}%`} tone="up" />
          <StatCard label="Average response time" value="1.4 days" />
          <StatCard label="Tasks overdue" value={overdueTasks} tone={overdueTasks > 0 ? "down" : "up"} />
          <StatCard label="Estimated subscription utilization" value="68%" sub="of Gold plan referral allotment" />
          <StatCard label="New referrals this period" value={referrals.length} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card><h2 className="font-semibold text-graphite-900 text-sm mb-3">Referrals by practice area</h2><MiniBarChart data={byPracticeArea} /></Card>
          <Card><h2 className="font-semibold text-graphite-900 text-sm mb-3">Referrals by jurisdiction</h2><MiniBarChart data={byJurisdiction} /></Card>
          <Card><h2 className="font-semibold text-graphite-900 text-sm mb-3">Decline reasons</h2><MiniBarChart data={declineReasons} /></Card>
          <Card><h2 className="font-semibold text-graphite-900 text-sm mb-3">Cases by stage</h2><MiniBarChart data={casesByStage} /></Card>
          <Card><h2 className="font-semibold text-graphite-900 text-sm mb-3">Lawyer workload (active matters)</h2><MiniBarChart data={workload} /></Card>
          <Card>
            <h2 className="font-semibold text-graphite-900 text-sm mb-3">New referrals trend (last 6 periods)</h2>
            <MiniLineChart points={[3, 5, 4, 7, 6, referrals.length]} />
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Consumer-to-lawyer conversion funnel</h2>
          <div className="grid sm:grid-cols-4 gap-3">
            {funnel.map((f, i) => (
              <div key={f.label} className="text-center">
                <div className="h-24 flex items-end justify-center">
                  <div className="w-16 bg-teal-500 rounded-t-md" style={{ height: `${(f.value / funnel[0].value) * 100}%` }} />
                </div>
                <p className="text-sm font-semibold text-graphite-900 mt-2">{f.value}</p>
                <p className="text-xs text-graphite-500">{f.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Referral source performance</h2>
          <table className="data-table">
            <thead><tr><th>Source</th><th>Referrals</th><th>Acceptance rate</th><th>Avg. readiness score</th></tr></thead>
            <tbody>
              <tr><td>JusticeChamp Consumer Intake</td><td>{referrals.filter((r) => r.source === "JusticeChamp Consumer Intake").length}</td><td>{acceptanceRate}%</td><td>{avgScore}</td></tr>
              <tr><td>Direct</td><td>0</td><td>—</td><td>—</td></tr>
              <tr><td>Partner firm</td><td>0</td><td>—</td><td>—</td></tr>
            </tbody>
          </table>
          <p className="text-[11px] text-graphite-400 mt-3">All analytics on this page are calculated from seeded demonstration data.</p>
        </Card>
      </div>
    </AppShell>
  );
}
