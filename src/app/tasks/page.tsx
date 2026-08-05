"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, EmptyState } from "@/components/ui";
import { TaskStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import { useAppState } from "@/lib/store";
import { TaskStatus } from "@/lib/types";

export default function TasksPage() {
  const { tasks, matters, team, updateTaskStatus } = useAppState();
  const [assignee, setAssignee] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => tasks.filter((t) => {
    if (assignee !== "all" && t.assigneeId !== assignee) return false;
    if (status !== "all" && t.status !== status) return false;
    return true;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [tasks, assignee, status]);

  function matterName(id: string) { return matters.find((m) => m.id === id)?.matterName ?? "Unknown matter"; }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Tasks" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Tasks Across All Matters</h1>

        <Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All assignees</option>
              {team.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
              <option value="all">All statuses</option>
              {(["not_started", "in_progress", "waiting", "complete", "cancelled"] as TaskStatus[]).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState title="No tasks match these filters" description="Create tasks from a matter's Tasks tab." />
        ) : (
          <Card className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Matter</th><th>Assignee</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td><Link href={`/matters/${t.matterId}`} className="text-teal-700 hover:underline">{matterName(t.matterId)}</Link></td>
                    <td>{team.find((m) => m.id === t.assigneeId)?.fullName ?? "Unassigned"}</td>
                    <td>{t.dueDate}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td>
                      <select value={t.status} onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)} className="text-xs rounded border border-graphite-200 px-1.5 py-1 focus-ring">
                        {(["not_started", "in_progress", "waiting", "complete", "cancelled"] as TaskStatus[]).map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </td>
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
