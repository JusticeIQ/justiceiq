"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, StatCard, MiniBarChart, InfoBanner } from "@/components/ui";
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

  const urgentDeadlineCount = upcomingDeadlines.filter((d) => {
    const days = (new Date(d.date).getTime() - new Date(today).getTime()) / 86400000;
    return days <= 3;
  }).length;
  const highValueCount = referrals.filter((r) => r.assessment.claimReadiness >= 75).length;

  const commandCenterItems: { tone: "teal" | "red" | "green" | "amber" | "gray"; text: string; href: string }[] = [
    { tone: "teal", text: `${newReferrals.length} new referral${newReferrals.length === 1 ? "" : "s"} need first review`, href: "/referrals" },
    { tone: "red", text: `${attentionMatters.length} case${attentionMatters.length === 1 ? "" : "s"} flagged at risk this week`, href: "/matters" },
    { tone: "green", text: `${highValueCount} high-value referral${highValueCount === 1 ? "" : "s"} (readiness score 75+) awaiting response`, href: "/referrals" },
    { tone: "amber", text: "One active matter is missing wage and medical records — request before the discovery deadline", href: "/matters" },
    { tone: "red", text: `${urgentDeadlineCount} deadline${urgentDeadlineCount === 1 ? "" : "s"} due within the next 3 days`, href: "/calendar" },
    { tone: "gray", text: "AI recommends requesting surveillance footage for two open premises-liability matters", href: "/matters" },
    { tone: "teal", text: "Estimated settlement probability rose 8% this week across 3 active matters", href: "/analytics" },
  ];

  const litigationIntelligence = [
    { label: "Case Success Index", value: "82 / 100", sub: "Firm-wide, trailing 12 months" },
    { label: "Firm Performance", value: "Top 18%", sub: "Vs. regional PI & employment firms" },
    { label: "Referral Quality", value: "8.4 / 10", sub: "Avg. JusticeChamp referral quality" },
    { label: "Avg. Settlement Prediction", value: "$142,000", sub: "Across active matter portfolio" },
  ];

  const jurisdictionTrends = [
    { label: "California", detail: "Slip-and-fall filings up 14% year over year" },
    { label: "Texas", detail: "Employment retaliation claims up 9% year over year" },
    { label: "Florida", detail: "Avg. personal injury settlement up 6% year over year" },
  ];
  const judgeAnalytics = [
    { label: "Judge M. Alvarez — Superior Court", detail: "Favors early mediation; avg. time-to-settlement 5.2 months" },
    { label: "Judge R. Simmons — District Court", detail: "Higher summary-judgment grant rate on employment matters" },
  ];
  const employerAnalytics = [
    { label: "Coastal Logistics Inc.", detail: "3 open matters; prior settlement avg. $95,000" },
    { label: "Meridian Retail Group", detail: "2 open matters; historically litigates past mediation" },
  ];
  const insuranceCarrierAnalytics = [
    { label: "Atlas Mutual Insurance", detail: "Avg. time-to-offer 34 days; typical opening offer 42% of demand" },
    { label: "Harborview Casualty", detail: "Avg. time-to-offer 21 days; typical opening offer 58% of demand" },
  ];

  const revenueIntelligence = [
    { label: "Expected Monthly Revenue", value: "$186,400", sub: "Based on active matter fee estimates" },
    { label: "Potential Fee Pipeline", value: "$1.24M", sub: "Referral + matter pipeline, all stages" },
    { label: "Referral Conversion", value: `${conversionRate}%`, sub: "Accepted or converted vs. decided" },
    { label: "Case Value Forecast", value: "$3.8M", sub: "12-month forward estimate, active portfolio" },
    { label: "AI Estimated Fees (this month)", value: "$42,900", sub: "Projected contingency fees, in-progress matters" },
  ];

  const aiAssistantFeed = [
    "Three employment referrals arrived overnight.",
    "This injury case is worth approximately $285,000.",
    "Request wage records for Reyes v. Coastal Logistics.",
    "Obtain surveillance footage for the Meridian premises-liability matter.",
    "The Ortiz referral consultation is unscheduled after 2 days — consider following up.",
  ];

  const consumerIntegration = [
    { label: "New Incident Reports (24h)", value: "6", sub: "Submitted via JusticeChamp™" },
    { label: "AI Qualified Leads", value: "4", sub: "Readiness score 70+" },
    { label: "Cases Awaiting Review", value: String(awaitingResponse.length), sub: "In SolonIQ referral queue" },
    { label: "Referral Acceptance Rate", value: "71%", sub: "Trailing 30 days" },
  ];

  const founderStats = [
    { label: "Total JusticeChamp users", value: "24,600+" },
    { label: "Active law firms", value: "138" },
    { label: "Qualified cases today", value: "212" },
    { label: "AI analyses completed", value: "1.2M+" },
    { label: "Documents generated", value: "86,400+" },
    { label: "Interview hours with lawyers", value: "3,140+" },
    { label: "Litigation dataset growth", value: "+18% MoM" },
  ];

  const biPreview = [
    "Rising slip-and-fall claims in Texas",
    "Employment retaliation trends accelerating in the Southeast",
    "Employer litigation heat map: logistics and retail sectors trending up",
    "Insurance settlement trends: carriers offering earlier, lower initial offers",
  ];

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

        <Card className="border-2 border-graphite-900">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-graphite-900">AI Command Center</h2>
            <Badge tone="navy">Your AI Chief Litigation Officer</Badge>
          </div>
          <p className="text-sm text-graphite-500 mb-4">What should I work on today?</p>
          <ul className="space-y-2.5">
            {commandCenterItems.map((item, i) => (
              <li key={i}>
                <Link href={item.href} className="flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-graphite-50 transition-colors">
                  <Badge tone={item.tone}>•</Badge>
                  <span className="text-sm text-graphite-800">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

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

        <Card>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-graphite-900">Litigation Intelligence</h2>
            <Badge tone="teal">Defensible data moat</Badge>
          </div>
          <p className="text-sm text-graphite-500 mb-4">Aggregate case, judge, employer, and carrier intelligence drawn from the SolonIQ litigation dataset.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {litigationIntelligence.map((m) => (
              <StatCard key={m.label} label={m.label} value={m.value} sub={m.sub} />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-graphite-50 border-none shadow-none">
              <h3 className="text-xs font-semibold text-graphite-900 uppercase tracking-wide mb-2">Jurisdiction trends</h3>
              <ul className="space-y-1.5">
                {jurisdictionTrends.map((j) => (
                  <li key={j.label} className="text-xs text-graphite-600"><span className="font-medium text-graphite-900">{j.label}:</span> {j.detail}</li>
                ))}
              </ul>
            </Card>
            <Card className="bg-graphite-50 border-none shadow-none">
              <h3 className="text-xs font-semibold text-graphite-900 uppercase tracking-wide mb-2">Judge analytics</h3>
              <ul className="space-y-1.5">
                {judgeAnalytics.map((j) => (
                  <li key={j.label} className="text-xs text-graphite-600"><span className="font-medium text-graphite-900">{j.label}:</span> {j.detail}</li>
                ))}
              </ul>
            </Card>
            <Card className="bg-graphite-50 border-none shadow-none">
              <h3 className="text-xs font-semibold text-graphite-900 uppercase tracking-wide mb-2">Employer analytics</h3>
              <ul className="space-y-1.5">
                {employerAnalytics.map((j) => (
                  <li key={j.label} className="text-xs text-graphite-600"><span className="font-medium text-graphite-900">{j.label}:</span> {j.detail}</li>
                ))}
              </ul>
            </Card>
            <Card className="bg-graphite-50 border-none shadow-none">
              <h3 className="text-xs font-semibold text-graphite-900 uppercase tracking-wide mb-2">Insurance carrier analytics</h3>
              <ul className="space-y-1.5">
                {insuranceCarrierAnalytics.map((j) => (
                  <li key={j.label} className="text-xs text-graphite-600"><span className="font-medium text-graphite-900">{j.label}:</span> {j.detail}</li>
                ))}
              </ul>
            </Card>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-graphite-900">Revenue Intelligence</h2>
            <Badge tone="green">Law firms buy revenue</Badge>
          </div>
          <p className="text-sm text-graphite-500 mb-4">Forward-looking revenue and fee estimates generated from the active referral and matter pipeline.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {revenueIntelligence.map((m) => (
              <StatCard key={m.label} label={m.label} value={m.value} sub={m.sub} tone="up" />
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-graphite-900">AI Assistant</h2>
              <Badge tone="navy">Proactive, everywhere</Badge>
            </div>
            <p className="text-sm text-graphite-500 mb-4">Suggestions surface automatically across the app — not just in a chat window.</p>
            <ul className="space-y-2.5">
              {aiAssistantFeed.map((s, i) => (
                <li key={i} className="text-sm text-graphite-800 bg-graphite-50 rounded-lg px-3 py-2">{s}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-graphite-900">Consumer + Lawyer Integration</h2>
              <Badge tone="teal">Fed by JusticeChamp™</Badge>
            </div>
            <p className="text-sm text-graphite-500 mb-4">JusticeChamp consumer intake flows directly into the SolonIQ referral pipeline.</p>
            <div className="grid grid-cols-2 gap-4">
              {consumerIntegration.map((m) => (
                <StatCard key={m.label} label={m.label} value={m.value} sub={m.sub} />
              ))}
            </div>
          </Card>
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

        <Card className="bg-graphite-950 text-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold">Founder Dashboard</h2>
            <Badge tone="teal">Platform-wide, all firms</Badge>
          </div>
          <p className="text-sm text-white/60 mb-4">Network-wide momentum across the SolonIQ ecosystem — illustrative figures for investor and founder review.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {founderStats.map((s) => (
              <div key={s.label} className="rounded-lg bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="text-xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-dashed">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-graphite-900">SolonIQ Intelligence</h2>
            <Badge tone="amber">Coming soon</Badge>
          </div>
          <p className="text-sm text-graphite-500 mb-4">A forward-looking preview of the market and litigation-trend intelligence this dataset will support.</p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {biPreview.map((s, i) => (
              <li key={i} className="text-sm text-graphite-700 bg-graphite-50 rounded-lg px-3 py-2">{s}</li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
