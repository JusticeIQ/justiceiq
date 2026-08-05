import Link from "next/link";
import { Card, Badge } from "@/components/ui";

function PublicHeader() {
  return (
    <header className="bg-graphite-950 text-white">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">IQ</span>
          <span className="font-semibold text-lg tracking-tight">JusticeIQ<span className="text-teal-400">™</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm text-white/80 hover:text-white">Sign in</Link>
          <Link href="/signup" className="px-4 py-2 text-sm rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">Create firm account</Link>
        </div>
      </div>
    </header>
  );
}

const WORKFLOW = [
  { n: "1", title: "Consumer submits an incident report", desc: "Via JusticeChamp™ Consumer Intake, the connected consumer application." },
  { n: "2", title: "Structured referral arrives in JusticeIQ", desc: "Complete with a claim summary and preliminary claim-readiness score." },
  { n: "3", title: "Lawyer reviews and responds", desc: "Accept, decline, or request more information — with conflict screening built in." },
  { n: "4", title: "Referral becomes a matter", desc: "Convert to a fully tracked matter with tasks, deadlines, documents, and billing." },
];

const PILLARS = [
  { title: "Referral intelligence", desc: "Structured claim summaries and readiness scores arrive pre-organized, not as a raw email." },
  { title: "Case management", desc: "Matters, tasks, deadlines, documents, and communications in one connected workspace." },
  { title: "Firm analytics", desc: "Pipeline conversion, response time, and workload visibility for firm leadership." },
  { title: "Built for compliance", desc: "Role-based access, conflict workflows, and audit trails designed around professional responsibility." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-graphite-50">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-graphite-950 text-white">
          <div className="container-page py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge tone="teal">Connected to JusticeChamp™ Consumer Intake</Badge>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-5">JusticeIQ™</h1>
              <p className="mt-3 text-lg md:text-xl font-semibold text-teal-400">
                The operating system for litigation intelligence.
              </p>
              <p className="mt-4 text-lg text-white/80 max-w-lg">
                Qualified legal opportunities. Structured case intelligence. One connected platform.
              </p>
              <p className="mt-4 text-white/60 max-w-lg text-sm">
                The professional law-firm portal for receiving qualified consumer referrals, managing matters end to end, and
                generating legal-business intelligence for firm leadership.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white">
                  Create a firm account
                </Link>
                <Link href="/demo" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Explore the demo tour
                </Link>
              </div>
            </div>
            <Card className="text-graphite-900">
              <p className="text-xs font-medium text-graphite-500 mb-3">New referral — preview</p>
              <div className="flex items-center justify-between">
                <div>
                  <Badge tone="teal">Personal Injury</Badge>
                  <p className="font-semibold mt-2">Motor vehicle accident</p>
                  <p className="text-xs text-graphite-500">California · Consumer #48213</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-600">78</p>
                  <p className="text-[11px] text-graphite-500">readiness score</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge tone="green">Evidence: Strong</Badge>
                <Badge tone="amber">Urgency: Moderate</Badge>
              </div>
            </Card>
          </div>
        </section>

        <section className="container-page py-16">
          <h2 className="text-2xl font-bold text-graphite-900 text-center">From consumer intake to a managed matter</h2>
          <div className="grid md:grid-cols-4 gap-5 mt-10">
            {WORKFLOW.map((w) => (
              <Card key={w.n}>
                <span className="h-8 w-8 rounded-full bg-graphite-900 text-white flex items-center justify-center text-sm font-semibold">{w.n}</span>
                <h3 className="mt-3 font-semibold text-graphite-900 text-sm">{w.title}</h3>
                <p className="mt-1 text-xs text-graphite-500">{w.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-graphite-100">
          <div className="container-page py-16">
            <h2 className="text-2xl font-bold text-graphite-900 text-center">Built to become litigation infrastructure</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mt-10">
              {PILLARS.map((p) => (
                <Card key={p.title}>
                  <h3 className="font-semibold text-graphite-900 text-sm">{p.title}</h3>
                  <p className="mt-1 text-xs text-graphite-500">{p.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-16">
          <Card className="bg-graphite-900 text-white text-center py-12">
            <h2 className="text-2xl font-bold">See the full referral-to-matter journey</h2>
            <p className="mt-2 text-white/70 max-w-xl mx-auto text-sm">
              Use the one-click demo law-firm account to explore a seeded pipeline of referrals, active matters, tasks,
              calendar, and firm analytics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/login" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white">
                Continue with demo law firm
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                View guided demo tour
              </Link>
            </div>
          </Card>
        </section>
      </main>
      <footer className="bg-graphite-950 text-white/50 text-xs text-center py-6 px-4">
        JusticeIQ is a technology platform and does not provide legal advice. All sample firm, lawyer, and referral data is fictional demonstration content. © 2026 JusticeIQ Technologies, Inc.
      </footer>
    </div>
  );
}
