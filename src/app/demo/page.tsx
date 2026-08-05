"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge } from "@/components/ui";
import { useAppState } from "@/lib/store";

const STEPS = [
  { n: 1, title: "Login using the demo law-firm account", href: "/login" },
  { n: 2, title: "View the firm dashboard", href: "/dashboard" },
  { n: 3, title: "Open New Referrals", href: "/referrals" },
  { n: 4, title: "Select a JusticeChamp referral", href: "/referrals/ref-1" },
  { n: 5, title: "Review the incident report and claim score", href: "/referrals/ref-1" },
  { n: 6, title: "Review documents and timeline", href: "/referrals/ref-1" },
  { n: 7, title: "Request additional information", href: "/referrals/ref-1" },
  { n: 8, title: "Run a simulated conflict check", href: "/referrals/ref-1" },
  { n: 9, title: "Schedule a consultation", href: "/referrals/ref-1" },
  { n: 10, title: "Accept the referral", href: "/referrals/ref-5" },
  { n: 11, title: "Convert the referral to a matter", href: "/referrals/ref-5" },
  { n: 12, title: "Assign lawyer and team", href: "/matters/matter-1" },
  { n: 13, title: "Import documents and chronology", href: "/matters/matter-1/documents" },
  { n: 14, title: "Create tasks and deadlines", href: "/matters/matter-1/tasks" },
  { n: 15, title: "Send a secure client message", href: "/matters/matter-1/communications" },
  { n: 16, title: "View the updated matter dashboard", href: "/matters/matter-1/overview" },
  { n: 17, title: "Review firm analytics", href: "/analytics" },
  { n: 18, title: "View subscription options", href: "/subscription" },
];

export default function DemoPage() {
  const router = useRouter();
  const { loginDemo } = useAppState();

  return (
    <div className="min-h-screen bg-graphite-50">
      <header className="bg-graphite-950 text-white">
        <div className="container-page py-14">
          <Badge tone="teal">Demo Tour</Badge>
          <h1 className="text-3xl font-bold mt-3">An 18-step, referral-to-matter guided walkthrough</h1>
          <p className="text-white/70 mt-2 max-w-2xl text-sm">
            Built for lawyer, investor, and partner demonstrations. Each step links directly into the live platform — use
            it as a presenter script or follow along yourself.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => { loginDemo(); router.push("/dashboard"); }}>
            Launch demo law firm
          </Button>
        </div>
      </header>

      <div className="container-page py-12">
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.n}>
              <Card className="flex items-center gap-4">
                <span className="h-8 w-8 shrink-0 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold">{step.n}</span>
                <p className="flex-1 text-sm font-medium text-graphite-900">{step.title}</p>
                <Link href={step.href} className="text-xs text-teal-600 font-medium hover:underline whitespace-nowrap">Open →</Link>
                {i < STEPS.length - 1 && (
                  <Link href={STEPS[i + 1].href} className="text-xs text-graphite-400 hover:text-teal-600 whitespace-nowrap hidden sm:inline">
                    Next step →
                  </Link>
                )}
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
