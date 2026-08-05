"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, InfoBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  firm_admin: "Firm Administrator", partner: "Partner", lawyer: "Lawyer", paralegal: "Paralegal",
  intake_coordinator: "Intake Coordinator", legal_assistant: "Legal Assistant", read_only_analyst: "Read-Only Analyst",
};

const PERMISSIONS = ["View referrals", "Respond to referrals", "Convert to matter", "Edit matters", "Delete matters", "Manage billing", "Manage team & permissions", "View analytics", "Export data"];
const PERMISSION_MATRIX: Record<UserRole, boolean[]> = {
  firm_admin: [true, true, true, true, true, true, true, true, true],
  partner: [true, true, true, true, true, true, false, true, true],
  lawyer: [true, true, true, true, false, false, false, true, false],
  paralegal: [true, false, false, true, false, false, false, false, false],
  intake_coordinator: [true, true, false, false, false, false, false, false, false],
  legal_assistant: [true, false, false, true, false, false, false, false, false],
  read_only_analyst: [true, false, false, false, false, false, false, true, false],
};

export default function TeamPage() {
  const { team, matters, tasks } = useAppState();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("lawyer");
  const [invited, setInvited] = useState<string[]>([]);

  function workload(memberId: string) {
    const activeMatters = matters.filter((m) => m.responsibleLawyerId === memberId && m.status === "active").length;
    const openTasks = tasks.filter((t) => t.assigneeId === memberId && t.status !== "complete" && t.status !== "cancelled").length;
    return { activeMatters, openTasks };
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Team" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-graphite-900">Team Administration</h1>
          <Button onClick={() => setShowInvite((v) => !v)}>Invite team member</Button>
        </div>

        {showInvite && (
          <Card className="border-teal-200">
            <h2 className="font-semibold text-graphite-900 text-sm mb-3">Invite a new team member</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <input placeholder="Work email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)} className="rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                {Object.entries(ROLE_LABEL).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
              </select>
              <Button disabled={!inviteEmail} onClick={() => { setInvited((prev) => [...prev, inviteEmail]); setInviteEmail(""); }}>Send invitation</Button>
            </div>
            {invited.length > 0 && (
              <p className="text-xs text-teal-700 mt-3">Invitations sent (simulated) to: {invited.join(", ")}</p>
            )}
          </Card>
        )}

        <Card className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Practice areas</th><th>Jurisdictions</th><th>Active matters</th><th>Open tasks</th><th>Status</th></tr></thead>
            <tbody>
              {team.map((t) => {
                const w = workload(t.id);
                return (
                  <tr key={t.id}>
                    <td><span className="font-medium text-graphite-900">{t.fullName}</span><div className="text-[11px] text-graphite-400">{t.title}</div></td>
                    <td><Badge tone="gray">{ROLE_LABEL[t.role]}</Badge></td>
                    <td>{t.practiceAreas.map((a) => a === "personal_injury" ? "Personal Injury" : "Employment Law").join(", ")}</td>
                    <td>{t.jurisdictions.join(", ")}</td>
                    <td>{w.activeMatters}</td>
                    <td>{w.openTasks}</td>
                    <td><Badge tone={t.active ? "teal" : "gray"}>{t.active ? "Active" : "Deactivated"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Permissions matrix</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Permission</th>{Object.values(ROLE_LABEL).map((label) => <th key={label}>{label}</th>)}</tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm, i) => (
                  <tr key={perm}>
                    <td className="font-medium text-graphite-900">{perm}</td>
                    {(Object.keys(ROLE_LABEL) as UserRole[]).map((role) => (
                      <td key={role} className="text-center">{PERMISSION_MATRIX[role][i] ? <span className="text-teal-600">✓</span> : <span className="text-graphite-300">—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <InfoBanner tone="gray">
          Role-based access is enforced at the database level in production via Supabase Row Level Security policies — see
          docs/ROLES_PERMISSIONS.md for the full matrix and docs/SECURITY.md for the enforcement model.
        </InfoBanner>
      </div>
    </AppShell>
  );
}
