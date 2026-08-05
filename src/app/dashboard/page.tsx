"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, StatCard, MiniBarChart, InfoBanner } from "@/components/ui";
import { ReferralStatusBadge } from "@/components/StatusBadges";
import { useAppState } from "@/lib/store";

export default function DashboardPage() {
  const { firm, team, referrals, matters, tasks, communications, calendarEvents, currentUser } = useAppState();

  const newReferrals = referrals.filter((r) => r.status === "new");
  const awaitingResponse = referrals.filter((r) => ["new", "under_review", "more_info_requested"].includes(r.status));
  const scheduled = referrals.filter((r) => r.status === "consultation_scheduled");
  const activeMatters = matters.filter((m) => m.status === "active");
  const attentionMatters = matters.filter((m) => m.riskStatus !== "on_track");
  const today = "2026-08-04";
  const upcomingDeadlines = [...matters.filter((m) => m.nextDeadline).map((m) => ({ label: m.nextDeadlineLabel, date: m.nextDeadline as string, matterId: m.id, matterName: m.matterName }))].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const overdueTasks = tasks.filter((t) => t.status !== "complete" && t.status !== "cancelled" && t.dueDate < today);
  const recentMessages = communications.filter((c) => c.type === "secure_message").slice(0, 4);
  const recentDocuments = matters.flatMap((m) => m.documents.map((d) => ({ ...d, matterName: m.matterName }))).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 4);

  const convertedCount = referrals.filter((r) => r.status === "converted").length;
  const decidedCount = referrals.filter((r) => ["converted", "declined", "accepted"].includes(r.status)).length;
  const conversionRate = decidedCount === 0 ? 0 : Math.round((convertedCount / decidedCount) * 100);

  const pipelineData = ["new", "under_review", "consultation_scheduled", "accepted", "converted"].map((status) => ({
    label: status.replace(/_/g, " "),
    value: referrals.filter((r) => r.status === status).length,
  }));

  const todayEvents = calendarEvents.filter((e) => e.date === today);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-graphite-900">Good morning, {currentUser?.fullName?.split(" ")[0] ?? "there"}</h1>
            <p className="text-graphite-500 text-sm mt-1">{firm?.name} — here's what's happening across the firm today.</p>
          </div>
          <Badge tone="teal">{firm?.subscriptionTier?.toUpperCase()} plan</Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Link href="/referrals"><Card className="hover:border-teal-300 border border-transparent transition-colors"><p className="text-sm font-semibold text-graphite-900">Review New Referrals</p><p className="text-xs text-graphite-500 mt-1">{newReferrals.length} new</p></Card></Link>
          <Link href="/referrals"><Card className="hover:border-teal-300 border border-transparent transition-colors"><p className="text-sm font-semibold text-graphite-900">Schedule Consultation</p><p className="text-xs text-graphite-500 mt-1">{scheduled.length} scheduled</p></Card></Link>
          <Link href="/matters"><Card className="hover:border-teal-300 border border-transparent transition-colors"><p className="text-sm font-semibold text-graphite-900">Open Current Cases</p><p className="text-xs text-graphite-500 mt-1">{activeMatters.length} active</p></Card></Link>
          <Link href="/calendar"><Card className="hover:border-teal-300 border border-transparent transition-colors"><p className="text-sm font-semibold text-graphite-900">View Today's Deadlines</p><p className="text-xs text-graphite-500 mt-1">{todayEvents.length} today</p></Card></Link>
          <Link href="/team"><Card className="hover:border-teal-300 border border-transparent transition-colors"><p className="text-sm font-semibold text-graphite-900">Invite Team Member</p><p className="text-xs text-graphite-500 mt-1">{team.length} on team</p></Card></Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="New referrals" value={newReferrals.length} sub="Awaiting first review" />
          <StatCard label="Active matters" value={activeMatters.length} sub={`${attentionMatters.length} need attention`} tone={attentionMatters.length > 0 ? "down" : "neutral"} />
          <StatCard label="Overdue tasks" value={overdueTasks.length} sub={overdueTasks.length > 0 ? "Needs attention" : "All caught up"} tone={overdueTasks.length > 0 ? "down" : "up"} />
          <StatCard label="Referral conversion rate" value={`${conversionRate}%`} sub="Accepted or converted vs. decided" tone="up" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-graphite-900 text-sm">Case pipeline</h2>
                <Link href="/referrals" className="text-xs text-teal-600 hover:underline">View all referrals →</Link>
              </div>
              <MiniBarChart data={pipelineData} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-graphite-900 text-sm">Referrals awaiting response</h2>
                <Link href="/referrals" className="text-xs text-teal-600 hover:underline">View all →</Link>
              </div>
              <table className="data-table">
                <thead><tr><th>Consumer</th><th>Claim type</th><th>Score</th><th>Status</th><th>Deadline</th></tr></thead>
                <tbody>
                  {awaitingResponse.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td><Link href={`/referrals/${r.id}`} className="text-teal-700 hover:underline">{r.consumerAnonymizedId}</Link></td>
                      <td>{r.subtype}</td>
                      <td>{r.assessment.claimReadiness}</td>
                      <td><ReferralStatusBadge status={r.status} /></td>
                      <td>{new Date(r.responseDeadline).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Matters requiring attention</h2>
              {attentionMatters.length === 0 ? <p className="text-sm text-graphite-500">No matters currently flagged.</p> : (
                <ul className="space-y-2">
                  {attentionMatters.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-sm">
                      <Link href={`/matters/${m.id}`} className="text-teal-700 hover:underline">{m.matterName}</Link>
                      <Badge tone={m.riskStatus === "at_risk" ? "red" : "amber"}>{m.riskStatus.replace(/_/g, " ")}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Upcoming deadlines</h2>
              <ul className="space-y-3">
                {upcomingDeadlines.map((d, i) => (
                  <li key={i} className="text-sm">
                    <Link href={`/matters/${d.matterId}`} className="text-graphite-900 font-medium hover:text-teal-600">{d.matterName}</Link>
                    <p className="text-xs text-graphite-500">{d.label} · {d.date}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Recent client messages</h2>
              <ul className="space-y-3">
                {recentMessages.map((c) => (
                  <li key={c.id} className="text-sm">
                    <p className="text-graphite-900 font-medium">{c.subject}</p>
                    <p className="text-xs text-graphite-500">{c.from} → {c.to} · {new Date(c.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Recently uploaded documents</h2>
              <ul className="space-y-3">
                {recentDocuments.map((d) => (
                  <li key={d.id} className="text-sm">
                    <p className="text-graphite-900 font-medium truncate">{d.name}</p>
                    <p className="text-xs text-graphite-500">{d.matterName}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-2">Firm performance summary</h2>
              <ul className="text-xs text-graphite-500 space-y-1.5">
                <li>Intake response time: <span className="text-graphite-900 font-medium">1.4 days avg.</span></li>
                <li>Consultation-to-retainer rate: <span className="text-graphite-900 font-medium">62%</span></li>
                <li>Subscription usage: <span className="text-graphite-900 font-medium">{referrals.length} / 150 referrals this period</span></li>
              </ul>
            </Card>

            <InfoBanner tone="gray">
              Dashboard metrics are calculated from seeded demonstration data for this MVP walkthrough.
            </InfoBanner>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
