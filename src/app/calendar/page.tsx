"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, InfoBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";

const TODAY = "2026-08-04";
const EVENT_TONE: Record<string, "teal" | "navy" | "amber" | "gray" | "red" | "green"> = {
  consultation: "teal", limitation_period: "red", court_deadline: "red", filing_deadline: "amber",
  medical_appointment: "gray", client_meeting: "navy", discovery: "gray", mediation: "amber",
  hearing: "red", trial: "red", internal_review: "gray", follow_up: "amber",
};
const DEADLINE_TYPES = ["limitation_period", "court_deadline", "filing_deadline"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const { calendarEvents, team, matters } = useAppState();
  const [view, setView] = useState<"month" | "week" | "day" | "deadlines">("month");
  const [lawyerFilter, setLawyerFilter] = useState("all");
  const [matterFilter, setMatterFilter] = useState("all");

  const filtered = useMemo(() => calendarEvents.filter((e) => {
    if (lawyerFilter !== "all" && e.lawyerId !== lawyerFilter) return false;
    if (matterFilter !== "all" && e.matterId !== matterFilter) return false;
    return true;
  }), [calendarEvents, lawyerFilter, matterFilter]);

  const year = 2026, month = 7; // August 2026 (0-indexed)
  const totalDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();

  const upcomingDeadlines = filtered.filter((e) => DEADLINE_TYPES.includes(e.type)).sort((a, b) => a.date.localeCompare(b.date));

  function lawyerName(id: string) { return team.find((t) => t.id === id)?.fullName ?? "Unknown"; }
  function matterName(id: string | null) { return id ? matters.find((m) => m.id === id)?.matterName ?? "Unknown matter" : "—"; }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Calendar" }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-graphite-900">Calendar & Deadlines</h1>
          <div className="flex gap-2">
            {(["month", "week", "day", "deadlines"] as const).map((v) => (
              <Button key={v} size="sm" variant={view === v ? "primary" : "outline"} onClick={() => setView(v)}>{v === "deadlines" ? "Deadline list" : `${v[0].toUpperCase()}${v.slice(1)} view`}</Button>
            ))}
          </div>
        </div>

        <InfoBanner tone="amber">
          JusticeIQ calendar reminders are a convenience tool. Lawyers remain fully responsible for independently
          verifying and calendaring all legal deadlines according to their firm's procedures.
        </InfoBanner>

        <Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <select value={lawyerFilter} onChange={(e) => setLawyerFilter(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All lawyers</option>
              {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
            <select value={matterFilter} onChange={(e) => setMatterFilter(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All matters</option>
              {matters.map((m) => <option key={m.id} value={m.id}>{m.matterName}</option>)}
            </select>
          </div>
        </Card>

        {view === "month" && (
          <Card className="overflow-x-auto">
            <p className="text-sm font-semibold text-graphite-900 mb-3">August 2026</p>
            <div className="grid grid-cols-7 gap-1 min-w-[640px]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="text-[11px] font-medium text-graphite-500 text-center py-1">{d}</div>)}
              {Array.from({ length: firstWeekday }).map((_, i) => <div key={`pad-${i}`} />)}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const dateStr = `2026-08-${String(day).padStart(2, "0")}`;
                const dayEvents = filtered.filter((e) => e.date === dateStr);
                return (
                  <div key={day} className={`border border-graphite-100 rounded-md p-1 min-h-[70px] text-[11px] ${dateStr === TODAY ? "bg-teal-50 border-teal-300" : ""}`}>
                    <p className="font-medium text-graphite-700">{day}</p>
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className="mt-0.5 truncate"><Badge tone={EVENT_TONE[e.type]}>{e.title}</Badge></div>
                    ))}
                    {dayEvents.length > 2 && <p className="text-graphite-400">+{dayEvents.length - 2} more</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {(view === "week" || view === "day") && (
          <Card>
            <p className="text-sm font-semibold text-graphite-900 mb-3">{view === "day" ? `Today — ${TODAY}` : "This week (Aug 3–9, 2026)"}</p>
            <ul className="space-y-2">
              {filtered.filter((e) => view === "day" ? e.date === TODAY : e.date >= "2026-08-03" && e.date <= "2026-08-09").sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm border-b border-graphite-100 pb-2">
                  <div>
                    <p className="text-graphite-900 font-medium">{e.title}</p>
                    <p className="text-xs text-graphite-500">{e.date} at {e.time} · {lawyerName(e.lawyerId)} · {matterName(e.matterId)}</p>
                  </div>
                  <Badge tone={EVENT_TONE[e.type]}>{e.type.replace(/_/g, " ")}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {view === "deadlines" && (
          <Card>
            <p className="text-sm font-semibold text-graphite-900 mb-3">Upcoming deadlines</p>
            <table className="data-table">
              <thead><tr><th>Deadline</th><th>Type</th><th>Date</th><th>Lawyer</th><th>Matter</th></tr></thead>
              <tbody>
                {upcomingDeadlines.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td><Badge tone={EVENT_TONE[e.type]}>{e.type.replace(/_/g, " ")}</Badge></td>
                    <td>{e.date}</td>
                    <td>{lawyerName(e.lawyerId)}</td>
                    <td>{e.matterId ? <Link href={`/matters/${e.matterId}`} className="text-teal-700 hover:underline">{matterName(e.matterId)}</Link> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Card>
          <p className="text-xs font-medium text-graphite-500 mb-2">Event categories</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENT_TONE).map(([type, tone]) => <Badge key={type} tone={tone}>{type.replace(/_/g, " ")}</Badge>)}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
