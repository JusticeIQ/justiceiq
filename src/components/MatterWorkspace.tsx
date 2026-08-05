"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button, InfoBanner, EmptyState } from "./ui";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { TaskStatusBadge, PriorityBadge } from "./StatusBadges";
import { useAppState } from "@/lib/store";
import { EMPLOYMENT_STAGES, PI_STAGES, MatterDocument, TaskPriority, TaskStatus } from "@/lib/types";

export type MatterTab = "overview" | "client" | "timeline" | "documents" | "tasks" | "calendar" | "communications" | "notes" | "parties" | "damages" | "billing" | "activity";

const TABS: { id: MatterTab; label: string; route?: string }[] = [
  { id: "overview", label: "Overview", route: "overview" },
  { id: "client", label: "Client" },
  { id: "timeline", label: "Timeline", route: "timeline" },
  { id: "documents", label: "Documents", route: "documents" },
  { id: "tasks", label: "Tasks", route: "tasks" },
  { id: "calendar", label: "Calendar" },
  { id: "communications", label: "Communications", route: "communications" },
  { id: "notes", label: "Notes" },
  { id: "parties", label: "Parties" },
  { id: "damages", label: "Damages" },
  { id: "billing", label: "Billing", route: "billing" },
  { id: "activity", label: "Activity Log" },
];

const RISK_TONE: Record<string, "green" | "amber" | "red"> = { on_track: "green", attention: "amber", at_risk: "red" };
const DOC_FOLDERS = ["Intake", "Correspondence", "Medical", "Employment Records", "Pleadings", "Discovery", "Expert Reports", "Damages", "Settlement", "Internal Work Product"];
const CONFIDENTIALITY_LABEL: Record<MatterDocument["confidentiality"], string> = { standard: "Standard", confidential: "Confidential", privileged: "Privileged", internal_only: "Internal Only" };

export function MatterWorkspace({ matterId, activeTab }: { matterId: string; activeTab: MatterTab }) {
  const { getMatter, clients, team, tasks, communications, calendarEvents, addTask, updateTaskStatus, addMatterNote, addMatterDocument, addCommunication, updateMatterStage } = useAppState();
  const matter = getMatter(matterId);

  const [noteBody, setNoteBody] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", assigneeId: "", dueDate: "2026-08-15", priority: "normal" as TaskPriority });
  const [docForm, setDocForm] = useState({ name: "", folder: "Intake", category: "Correspondence", confidentiality: "standard" as MatterDocument["confidentiality"], clientVisible: true });
  const [msgForm, setMsgForm] = useState({ subject: "", body: "" });

  if (!matter) {
    return <EmptyState title="Matter not found" description="This matter may not exist in the demo dataset." action={<Link href="/matters"><Button>Back to Current Cases</Button></Link>} />;
  }

const client = clients.find((c) => c.id === matter.clientId);
  const stages: readonly string[] = matter.category === "personal_injury" ? PI_STAGES : EMPLOYMENT_STAGES;
  const stageIndex = stages.indexOf(matter.stage);
  const matterTasks = tasks.filter((t) => t.matterId === matter.id);
  const matterComms = communications.filter((c) => c.matterId === matter.id);
  const matterEvents = calendarEvents.filter((e) => e.matterId === matter.id);
  const responsibleLawyer = team.find((t) => t.id === matter.responsibleLawyerId);
  const teamMembers = team.filter((t) => matter.teamMemberIds.includes(t.id));

  function tabHref(tab: (typeof TABS)[number]) {
    return tab.route ? `/matters/${matter!.id}/${tab.route}` : `/matters/${matter!.id}?tab=${tab.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={matter.category === "personal_injury" ? "teal" : "navy"}>{matter.practiceArea}</Badge>
            <Badge tone="gray">{matter.matterNumber}</Badge>
            <Badge tone={RISK_TONE[matter.riskStatus]}>{matter.riskStatus.replace(/_/g, " ")}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-graphite-900 mt-2">{matter.matterName}</h1>
          <p className="text-sm text-graphite-500 mt-1">Client: {client?.fullName} · Opened {matter.openDate}</p>
          {matter.sourceReferralId && (
            <p className="text-xs text-graphite-400 mt-1">
              Converted from referral <Link href={`/referrals/${matter.sourceReferralId}`} className="text-teal-600 hover:underline">{matter.sourceReferralId}</Link> (JusticeChamp Consumer Intake)
            </p>
          )}
        </div>
      </div>

      <Card>
        <p className="text-xs font-medium text-graphite-500 mb-3">Matter stage progress</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center shrink-0">
              <button
                onClick={() => updateMatterStage(matter!.id, s)}
                className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap focus-ring ${i === stageIndex ? "bg-teal-500 border-teal-500 text-white font-medium" : i < stageIndex ? "bg-teal-50 border-teal-200 text-teal-700" : "border-graphite-200 text-graphite-400"}`}
              >
                {s}
              </button>
              {i < stages.length - 1 && <span className="w-3 h-px bg-graphite-200 mx-1" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-1 overflow-x-auto border-b border-graphite-200">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={tabHref(t)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 focus-ring ${activeTab === t.id ? "border-teal-500 text-teal-700" : "border-transparent text-graphite-500 hover:text-graphite-900"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-2">Matter summary</h2>
              <p className="text-sm text-graphite-700">{matter.caseGoals}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                <div><p className="text-xs text-graphite-500">Responsible lawyer</p><p className="text-graphite-900">{responsibleLawyer?.fullName}</p></div>
                <div><p className="text-xs text-graphite-500">Team members</p><p className="text-graphite-900">{teamMembers.map((t) => t.fullName).join(", ") || "—"}</p></div>
                <div><p className="text-xs text-graphite-500">Next deadline</p><p className="text-graphite-900">{matter.nextDeadline ?? "—"} {matter.nextDeadlineLabel && `— ${matter.nextDeadlineLabel}`}</p></div>
                <div><p className="text-xs text-graphite-500">Client-contact status</p><p className="text-graphite-900">{matter.clientPortalStatus.replace(/_/g, " ")}</p></div>
                <div><p className="text-xs text-graphite-500">Document completeness</p><p className="text-graphite-900">{matter.documents.length} documents on file</p></div>
                <div><p className="text-xs text-graphite-500">Retainer / consent</p><p className="text-graphite-900">{matter.retainerStatus.replace(/_/g, " ")} / {matter.consentStatus}</p></div>
              </div>
              <InfoBanner tone="teal">Next recommended action: {matter.nextRecommendedAction}</InfoBanner>
            </Card>
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-2">Upcoming tasks</h2>
              <ul className="space-y-2">
                {matterTasks.filter((t) => t.status !== "complete" && t.status !== "cancelled").slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-graphite-900">{t.title}</span>
                    <span className="flex items-center gap-2"><PriorityBadge priority={t.priority} /><span className="text-xs text-graphite-500">{t.dueDate}</span></span>
                  </li>
                ))}
                {matterTasks.length === 0 && <p className="text-sm text-graphite-500">No tasks yet.</p>}
              </ul>
            </Card>
          </div>
          <div className="space-y-4">
            <AIAssistantPanel context="this matter" />
          </div>
        </div>
      )}

      {activeTab === "client" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Client profile</h2>
          {client ? (
            <div className="space-y-4 text-sm">
              <dl className="grid sm:grid-cols-2 gap-4">
                <div><dt className="text-xs text-graphite-500">Name</dt><dd className="text-graphite-900">{client.fullName}</dd></div>
                <div><dt className="text-xs text-graphite-500">Email</dt><dd className="text-graphite-900">{client.email}</dd></div>
                <div><dt className="text-xs text-graphite-500">Phone</dt><dd className="text-graphite-900">{client.phone || "—"}</dd></div>
                <div><dt className="text-xs text-graphite-500">Portal status</dt><dd className="text-graphite-900">{client.portalStatus.replace(/_/g, " ")}</dd></div>
                <div><dt className="text-xs text-graphite-500">Relationship owner</dt><dd className="text-graphite-900">{team.find((t) => t.id === client.relationshipOwnerId)?.fullName}</dd></div>
              </dl>
              <div>
                <p className="text-xs text-graphite-500 mb-1">Consent history</p>
                <ul className="space-y-1">{client.consentHistory.map((c, i) => <li key={i} className="text-graphite-900">{c.label} — {c.date} ({c.granted ? "granted" : "declined"})</li>)}</ul>
              </div>
              <InfoBanner tone="gray">
                From this matter, lawyers can view the original JusticeChamp incident report and claim-readiness score,
                request additional information, send document requests, share selected updates, and send secure messages —
                each recorded in the audit trail. See Communications and Activity Log for the shared-information history.
              </InfoBanner>
            </div>
          ) : <p className="text-sm text-graphite-500">No client on file.</p>}
        </Card>
      )}

      {activeTab === "timeline" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Timeline ({matter.timeline.length} events)</h2>
          <ol className="space-y-3">
            {matter.timeline.map((e) => (
              <li key={e.id} className="text-sm border-l-2 border-teal-400 pl-3">
                <p className="font-medium text-graphite-900">{e.date} — {e.title}</p>
                <p className="text-graphite-500">{e.description}</p>
                {e.peopleInvolved && <p className="text-xs text-graphite-400">Involved: {e.peopleInvolved}</p>}
              </li>
            ))}
            {matter.timeline.length === 0 && <p className="text-sm text-graphite-500">No timeline events yet.</p>}
          </ol>
        </Card>
      )}

      {activeTab === "documents" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Documents ({matter.documents.length})</h2>
              <ul className="space-y-2">
                {matter.documents.map((d) => (
                  <li key={d.id} className="border border-graphite-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-graphite-900">{d.name}</p>
                      <Badge tone={d.confidentiality === "privileged" ? "red" : d.confidentiality === "confidential" ? "amber" : "gray"}>{CONFIDENTIALITY_LABEL[d.confidentiality]}</Badge>
                    </div>
                    <p className="text-xs text-graphite-500 mt-1">{d.folder} · {d.category} · uploaded by {d.uploadedBy} on {new Date(d.uploadedAt).toLocaleDateString()} · {d.sizeLabel}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge tone={d.clientVisible ? "teal" : "gray"}>{d.clientVisible ? "Client-visible" : "Internal only"}</Badge>
                      {d.tags.map((tag) => <Badge key={tag} tone="gray">#{tag}</Badge>)}
                    </div>
                  </li>
                ))}
                {matter.documents.length === 0 && <p className="text-sm text-graphite-500">No documents yet.</p>}
              </ul>
            </Card>
          </div>
          <Card>
            <h2 className="font-semibold text-graphite-900 text-sm mb-3">Upload document (simulated)</h2>
            <div className="space-y-2">
              <input placeholder="File name" value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              <select value={docForm.folder} onChange={(e) => setDocForm({ ...docForm, folder: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                {DOC_FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={docForm.confidentiality} onChange={(e) => setDocForm({ ...docForm, confidentiality: e.target.value as MatterDocument["confidentiality"] })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                <option value="standard">Standard</option>
                <option value="confidential">Confidential</option>
                <option value="privileged">Privileged</option>
                <option value="internal_only">Internal Only</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-graphite-600">
                <input type="checkbox" checked={docForm.clientVisible} onChange={(e) => setDocForm({ ...docForm, clientVisible: e.target.checked })} /> Client-visible
              </label>
              <Button
                size="sm" className="w-full" disabled={!docForm.name}
                onClick={() => { addMatterDocument(matter!.id, { name: docForm.name, folder: docForm.folder, category: docForm.category, uploadedBy: "You", confidentiality: docForm.confidentiality, clientVisible: docForm.clientVisible, tags: [], sizeLabel: "1.2 MB" }); setDocForm({ ...docForm, name: "" }); }}
              >
                Upload
              </Button>
              <p className="text-[11px] text-graphite-400">Drag-and-drop and version history are simulated in this MVP.</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Tasks ({matterTasks.length})</h2>
              <table className="data-table">
                <thead><tr><th>Title</th><th>Assignee</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {matterTasks.map((t) => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
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
                  {matterTasks.length === 0 && <tr><td colSpan={5} className="text-graphite-500">No tasks yet.</td></tr>}
                </tbody>
              </table>
            </Card>
          </div>
          <Card>
            <h2 className="font-semibold text-graphite-900 text-sm mb-3">New task</h2>
            <div className="space-y-2">
              <input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              <select value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                <option value="">Assign to...</option>
                {team.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                {(["low", "normal", "high", "urgent"] as TaskPriority[]).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <Button
                size="sm" className="w-full" disabled={!taskForm.title || !taskForm.assigneeId}
                onClick={() => { addTask({ matterId: matter!.id, title: taskForm.title, assigneeId: taskForm.assigneeId, dueDate: taskForm.dueDate, priority: taskForm.priority, status: "not_started", description: "", checklist: [], createdBy: "You" }); setTaskForm({ ...taskForm, title: "" }); }}
              >
                Create task
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "calendar" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Matter calendar events</h2>
          <ul className="space-y-2">
            {matterEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm border-b border-graphite-100 pb-2">
                <span className="text-graphite-900">{e.title}</span>
                <span className="text-xs text-graphite-500">{e.date} {e.time} · {e.type.replace(/_/g, " ")}</span>
              </li>
            ))}
            {matterEvents.length === 0 && <p className="text-sm text-graphite-500">No calendar events linked to this matter yet.</p>}
          </ul>
          <Link href="/calendar" className="text-xs text-teal-600 hover:underline block mt-3">Open full firm calendar →</Link>
        </Card>
      )}

      {activeTab === "communications" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Communications ({matterComms.length})</h2>
              <ul className="space-y-3">
                {matterComms.map((c) => (
                  <li key={c.id} className="border border-graphite-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-graphite-900">{c.subject}</p>
                      <Badge tone="gray">{c.type.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-sm text-graphite-700 mt-1">{c.body}</p>
                    <p className="text-xs text-graphite-400 mt-1">{c.from} → {c.to} · {new Date(c.createdAt).toLocaleString()}</p>
                  </li>
                ))}
                {matterComms.length === 0 && <p className="text-sm text-graphite-500">No communications logged yet.</p>}
              </ul>
            </Card>
          </div>
          <Card>
            <h2 className="font-semibold text-graphite-900 text-sm mb-3">Send secure message</h2>
            <div className="space-y-2">
              <input placeholder="Subject" value={msgForm.subject} onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              <textarea placeholder="Message" rows={4} value={msgForm.body} onChange={(e) => setMsgForm({ ...msgForm, body: e.target.value })} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              <Button
                size="sm" className="w-full" disabled={!msgForm.subject || !msgForm.body}
                onClick={() => { addCommunication({ matterId: matter!.id, referralId: null, clientId: matter!.clientId, type: "secure_message", from: "You", to: client?.fullName ?? "Client", subject: msgForm.subject, body: msgForm.body, teamMemberId: "tm-1" }); setMsgForm({ subject: "", body: "" }); }}
              >
                Send (demo delivery log)
              </Button>
              <p className="text-[11px] text-graphite-400">Real email sending is not enabled in this MVP; messages are recorded in a demo delivery log.</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "notes" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Notes</h2>
          <div className="flex gap-2 mb-4">
            <input value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Add a note..." className="flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            <Button size="sm" onClick={() => { if (noteBody.trim()) { addMatterNote(matter!.id, noteBody.trim()); setNoteBody(""); } }}>Add note</Button>
          </div>
          <ul className="space-y-3">
            {matter.notes.map((n) => (
              <li key={n.id} className="text-sm border-b border-graphite-100 pb-2">
                <p className="text-graphite-900">{n.body}</p>
                <p className="text-xs text-graphite-400 mt-1">{n.authorName} · {new Date(n.createdAt).toLocaleString()}</p>
              </li>
            ))}
            {matter.notes.length === 0 && <p className="text-sm text-graphite-500">No notes yet.</p>}
          </ul>
        </Card>
      )}

      {activeTab === "parties" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Parties</h2>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Contact info</th></tr></thead>
            <tbody>
              {matter.parties.map((p) => (
                <tr key={p.id}><td>{p.name}</td><td><Badge tone="gray">{p.role.replace(/_/g, " ")}</Badge></td><td>{p.contactInfo}</td></tr>
              ))}
              {matter.parties.length === 0 && <tr><td colSpan={3} className="text-graphite-500">No parties recorded yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === "damages" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Damages</h2>
          <InfoBanner tone="amber">All amounts are preliminary internal working records, not guaranteed recovery values.</InfoBanner>
          <table className="data-table mt-3">
            <thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              {matter.damages.map((d) => (
                <tr key={d.id}><td>{d.category}</td><td>{d.description}</td><td>${d.amount.toLocaleString()}</td></tr>
              ))}
              {matter.damages.length === 0 && <tr><td colSpan={3} className="text-graphite-500">No damages recorded yet.</td></tr>}
            </tbody>
            {matter.damages.length > 0 && (
              <tfoot><tr><td className="font-semibold">Total</td><td /><td className="font-semibold">${matter.damages.reduce((s, d) => s + d.amount, 0).toLocaleString()}</td></tr></tfoot>
            )}
          </table>
        </Card>
      )}

      {activeTab === "billing" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Billing</h2>
          <InfoBanner tone="gray">Billing and trust accounting integration (e.g. LawPay, QuickBooks) is a planned integration — see the Integrations page. This tab shows a preliminary internal summary only.</InfoBanner>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm mt-3">
            <div><dt className="text-xs text-graphite-500">Retainer status</dt><dd className="text-graphite-900">{matter.retainerStatus.replace(/_/g, " ")}</dd></div>
            <div><dt className="text-xs text-graphite-500">Fee arrangement</dt><dd className="text-graphite-900">Contingency (illustrative)</dd></div>
            <div><dt className="text-xs text-graphite-500">Trust balance</dt><dd className="text-graphite-900">$0.00 (not connected)</dd></div>
            <div><dt className="text-xs text-graphite-500">Outstanding invoices</dt><dd className="text-graphite-900">None on file</dd></div>
          </dl>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Activity log</h2>
          <ul className="space-y-2 text-sm">
            <li className="text-graphite-700">Matter last updated {new Date(matter.lastActivityAt).toLocaleString()}</li>
            {matter.sourceReferralId && <li className="text-graphite-700">Converted from referral {matter.sourceReferralId}</li>}
            <li className="text-graphite-700">Stage set to "{matter.stage}"</li>
          </ul>
          <p className="text-[11px] text-graphite-400 mt-3">Full immutable audit logging is a production roadmap item — see docs/SECURITY.md.</p>
        </Card>
      )}
    </div>
  );
}
