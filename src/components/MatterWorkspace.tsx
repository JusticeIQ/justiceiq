"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button, ProgressBar, StatCard, EmptyState, InfoBanner } from "@/components/ui";
import { PI_STAGES, EMPLOYMENT_STAGES } from "@/lib/types";
import { useAppState } from "@/lib/store";

export type MatterTab =
  | "overview"
  | "documents"
  | "timeline"
  | "tasks"
  | "communications"
  | "billing"
  | "client"
  | "calendar"
  | "notes"
  | "parties"
  | "damages"
  | "activity";

const TABS: { key: MatterTab; label: string; href: (id: string) => string }[] = [
  { key: "overview", label: "Overview", href: (id) => `/matters/${id}` },
  { key: "documents", label: "Documents", href: (id) => `/matters/${id}/documents` },
  { key: "timeline", label: "Timeline", href: (id) => `/matters/${id}/timeline` },
  { key: "tasks", label: "Tasks", href: (id) => `/matters/${id}/tasks` },
  { key: "communications", label: "Communications", href: (id) => `/matters/${id}/communications` },
  { key: "billing", label: "Billing", href: (id) => `/matters/${id}/billing` },
  { key: "client", label: "Client", href: (id) => `/matters/${id}?tab=client` },
  { key: "calendar", label: "Calendar", href: (id) => `/matters/${id}?tab=calendar` },
  { key: "notes", label: "Notes", href: (id) => `/matters/${id}?tab=notes` },
  { key: "parties", label: "Parties", href: (id) => `/matters/${id}?tab=parties` },
  { key: "damages", label: "Damages", href: (id) => `/matters/${id}?tab=damages` },
  { key: "activity", label: "Activity Log", href: (id) => `/matters/${id}?tab=activity` },
];

function riskTone(risk: string): "green" | "amber" | "red" {
  if (risk === "at_risk") return "red";
  if (risk === "attention") return "amber";
  return "green";
}

export function MatterWorkspace({ matterId, activeTab }: { matterId: string; activeTab: MatterTab }) {
  const {
    getMatter, clients, team, tasks, communications, calendarEvents, activityLog,
    addMatterNote, addMatterDocument, addCommunication, addTask, updateTaskStatus, updateMatterStage,
  } = useAppState();

  const [noteBody, setNoteBody] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newCommBody, setNewCommBody] = useState("");

  const matter = getMatter(matterId);
  const tab = activeTab || "overview";

  if (!matter) {
    return (
      <Card>
        <EmptyState title="Matter not found" description="This matter may have been removed, or the link is out of date." action={<Link href="/matters"><Button>Back to Current Cases</Button></Link>} />
      </Card>
    );
  }

  const client = clients.find((c) => c.id === matter.clientId);
  const responsibleLawyer = team.find((t) => t.id === matter.responsibleLawyerId);
  const teamMembers = team.filter((t) => matter.teamMemberIds.includes(t.id));
  const matterTasks = tasks.filter((t) => t.matterId === matter.id);
  const matterComms = communications.filter((c) => c.matterId === matter.id);
  const matterEvents = calendarEvents.filter((e) => e.matterId === matter.id);
  const openTasks = matterTasks.filter((t) => t.status !== "complete" && t.status !== "cancelled");

  const stages = matter.category === "personal_injury" ? PI_STAGES : EMPLOYMENT_STAGES;
  const stageList = stages as readonly string[];
  const stageIndex = stageList.indexOf(matter.stage);
  const stageProgress = stageIndex >= 0 ? Math.round(((stageIndex + 1) / stageList.length) * 100) : 0;

  const totalDamages = matter.damages.reduce((sum, d) => sum + d.amount, 0);
  const matterActivity = activityLog.filter((a) => a.message.includes(matter.id) || a.message.includes(matter.matterName));

  function handleAddNote() {
    if (!noteBody.trim()) return;
    addMatterNote(matter!.id, noteBody.trim());
    setNoteBody("");
  }

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    addTask({
      matterId: matter!.id,
      title: newTaskTitle.trim(),
      assigneeId: matter!.responsibleLawyerId,
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "normal",
      status: "not_started",
      description: "",
      checklist: [],
      createdBy: "Sarah Kim",
    });
    setNewTaskTitle("");
  }

  function handleAddComm() {
    if (!newCommBody.trim()) return;
    addCommunication({
      matterId: matter!.id,
      referralId: null,
      clientId: matter!.clientId,
      type: "internal_comment",
      from: "Sarah Kim",
      to: client?.fullName ?? "Client",
      subject: "Case note",
      body: newCommBody.trim(),
      teamMemberId: "tm-1",
    });
    setNewCommBody("");
  }

  return (
    <div className="space-y-4">
      <Card className="py-3">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href(matter.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-graphite-900 text-white" : "text-graphite-600 hover:bg-graphite-50"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </Card>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-graphite-900">{matter.matterName}</h1>
              <p className="text-sm text-graphite-500">{matter.matterNumber} · {matter.practiceArea} · {matter.jurisdiction}</p>
            </div>
            <Badge tone={riskTone(matter.riskStatus)}>{matter.riskStatus.replace(/_/g, " ")}</Badge>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-graphite-900 text-sm">Stage: {matter.stage}</h2>
              <span className="text-xs text-graphite-500">{stageProgress}% through {matter.category === "personal_injury" ? "personal injury" : "employment"} lifecycle</span>
            </div>
            <ProgressBar value={stageProgress} />
            <div className="mt-3 flex flex-wrap gap-2">
              {stageList.map((s, i) => (
                <button
                  key={s}
                  onClick={() => updateMatterStage(matter.id, s)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    i === stageIndex ? "bg-navy-900 text-white border-navy-900" : "text-graphite-500 border-graphite-200 hover:border-graphite-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Open tasks" value={openTasks.length} sub={`${matterTasks.length} total`} />
            <StatCard label="Documents" value={matter.documents.length} />
            <StatCard label="Damages claimed" value={`$${totalDamages.toLocaleString()}`} sub={`${matter.damages.length} line items`} />
            <StatCard label="Retainer" value={matter.retainerStatus.replace(/_/g, " ")} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-2">Case details</h2>
              <ul className="text-sm text-graphite-600 space-y-1.5">
                <li><span className="text-graphite-400">Client:</span> {client?.fullName ?? "Unknown"}</li>
                <li><span className="text-graphite-400">Responsible lawyer:</span> {responsibleLawyer?.fullName ?? "Unassigned"}</li>
                <li><span className="text-graphite-400">Team:</span> {teamMembers.map((t) => t.fullName).join(", ") || "—"}</li>
                <li><span className="text-graphite-400">Open date:</span> {matter.openDate}</li>
                <li><span className="text-graphite-400">Next deadline:</span> {matter.nextDeadline ? `${matter.nextDeadlineLabel} (${matter.nextDeadline})` : "None scheduled"}</li>
                <li><span className="text-graphite-400">Consent status:</span> {matter.consentStatus}</li>
                <li><span className="text-graphite-400">Client portal:</span> {matter.clientPortalStatus.replace(/_/g, " ")}</li>
              </ul>
            </Card>
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-2">Case goals &amp; next action</h2>
              <p className="text-sm text-graphite-600 mb-3">{matter.caseGoals || "No case goals recorded yet."}</p>
              <InfoBanner tone="teal">{matter.nextRecommendedAction || "No recommended next action recorded."}</InfoBanner>
            </Card>
          </div>
        </div>
      )}

      {tab === "documents" && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-graphite-900 text-sm">Documents ({matter.documents.length})</h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                addMatterDocument(matter.id, {
                  name: "New document.pdf",
                  folder: "General",
                  category: "General",
                  uploadedBy: "Sarah Kim",
                  confidentiality: "standard",
                  clientVisible: false,
                  tags: [],
                  sizeLabel: "—",
                })
              }
            >
              Add document
            </Button>
          </div>
          {matter.documents.length === 0 ? (
            <EmptyState title="No documents yet" description="Documents uploaded for this matter will appear here." />
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Folder</th><th>Category</th><th>Confidentiality</th><th>Uploaded</th></tr></thead>
              <tbody>
                {matter.documents.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.folder}</td>
                    <td>{d.category}</td>
                    <td><Badge tone={d.confidentiality === "privileged" ? "red" : d.confidentiality === "confidential" ? "amber" : "gray"}>{d.confidentiality}</Badge></td>
                    <td>{new Date(d.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "timeline" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Timeline ({matter.timeline.length})</h2>
          {matter.timeline.length === 0 ? (
            <EmptyState title="No timeline events" description="Key events for this matter will appear here as the case progresses." />
          ) : (
            <ul className="space-y-3">
              {matter.timeline.map((t) => (
                <li key={t.id} className="border-l-2 border-teal-500 pl-3">
                  <p className="text-xs text-graphite-400">{t.date}</p>
                  <p className="text-sm font-medium text-graphite-900">{t.title}</p>
                  <p className="text-sm text-graphite-600">{t.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "tasks" && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-graphite-900 text-sm">Tasks ({matterTasks.length})</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task title"
              className="flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm"
            />
            <Button size="sm" onClick={handleAddTask}>Add task</Button>
          </div>
          {matterTasks.length === 0 ? (
            <EmptyState title="No tasks yet" description="Tasks assigned to this matter will appear here." />
          ) : (
            <ul className="space-y-2">
              {matterTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm border-b border-graphite-100 pb-2">
                  <div>
                    <p className="font-medium text-graphite-900">{t.title}</p>
                    <p className="text-xs text-graphite-500">Due {t.dueDate} · {t.priority} priority</p>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value as typeof t.status)}
                    className="text-xs rounded-lg border border-graphite-200 px-2 py-1"
                  >
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="complete">Complete</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "communications" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Communications ({matterComms.length})</h2>
          <div className="flex gap-2 mb-4">
            <input
              value={newCommBody}
              onChange={(e) => setNewCommBody(e.target.value)}
              placeholder="Log a note or message"
              className="flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm"
            />
            <Button size="sm" onClick={handleAddComm}>Log</Button>
          </div>
          {matterComms.length === 0 ? (
            <EmptyState title="No communications logged" description="Messages, calls, and notes for this matter will appear here." />
          ) : (
            <ul className="space-y-3">
              {matterComms.map((c) => (
                <li key={c.id} className="text-sm border-b border-graphite-100 pb-2">
                  <p className="text-graphite-900 font-medium">{c.subject}</p>
                  <p className="text-graphite-600">{c.body}</p>
                  <p className="text-xs text-graphite-400">{c.from} → {c.to} · {new Date(c.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "billing" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Billing</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <StatCard label="Retainer status" value={matter.retainerStatus.replace(/_/g, " ")} />
            <StatCard label="Damages claimed" value={`$${totalDamages.toLocaleString()}`} />
            <StatCard label="Matter number" value={matter.matterNumber} />
          </div>
          <InfoBanner tone="gray">
            Detailed invoicing and time-entry billing is not yet part of this MVP's data model. This panel summarizes retainer and estimated case value in the meantime.
          </InfoBanner>
        </Card>
      )}

      {tab === "client" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Client</h2>
          {!client ? (
            <EmptyState title="No client record" description="This matter is not linked to a client record." />
          ) : (
            <ul className="text-sm text-graphite-600 space-y-1.5">
              <li><span className="text-graphite-400">Name:</span> {client.fullName}</li>
              <li><span className="text-graphite-400">Email:</span> {client.email}</li>
              <li><span className="text-graphite-400">Phone:</span> {client.phone || "—"}</li>
              <li><span className="text-graphite-400">Address:</span> {client.address || "—"}</li>
              <li><span className="text-graphite-400">Portal status:</span> {client.portalStatus.replace(/_/g, " ")}</li>
              <li className="pt-2">
                <span className="text-graphite-400">Consent history:</span>
                <ul className="mt-1 space-y-1">
                  {client.consentHistory.map((c, i) => (
                    <li key={i} className="text-xs">{c.label} — {c.date} {c.granted ? "(granted)" : "(not granted)"}</li>
                  ))}
                </ul>
              </li>
            </ul>
          )}
        </Card>
      )}

      {tab === "calendar" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Calendar ({matterEvents.length})</h2>
          {matterEvents.length === 0 ? (
            <EmptyState title="No calendar events" description="Deadlines and meetings for this matter will appear here." />
          ) : (
            <ul className="space-y-2">
              {matterEvents.map((e) => (
                <li key={e.id} className="text-sm border-b border-graphite-100 pb-2">
                  <p className="font-medium text-graphite-900">{e.title}</p>
                  <p className="text-xs text-graphite-500">{e.date} at {e.time} · {e.type.replace(/_/g, " ")}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "notes" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Notes ({matter.notes.length})</h2>
          <div className="flex gap-2 mb-4">
            <input
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Add an internal note"
              className="flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm"
            />
            <Button size="sm" onClick={handleAddNote}>Add note</Button>
          </div>
          {matter.notes.length === 0 ? (
            <EmptyState title="No notes yet" description="Internal notes for this matter will appear here." />
          ) : (
            <ul className="space-y-3">
              {matter.notes.map((n) => (
                <li key={n.id} className="text-sm border-b border-graphite-100 pb-2">
                  <p className="text-graphite-600">{n.body}</p>
                  <p className="text-xs text-graphite-400">{n.authorName} · {new Date(n.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "parties" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Parties ({matter.parties.length})</h2>
          {matter.parties.length === 0 ? (
            <EmptyState title="No parties recorded" description="Parties involved in this matter will appear here." />
          ) : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Role</th><th>Contact</th></tr></thead>
              <tbody>
                {matter.parties.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.role.replace(/_/g, " ")}</td>
                    <td>{p.contactInfo || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "damages" && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-graphite-900 text-sm">Damages ({matter.damages.length})</h2>
            <span className="text-sm font-semibold text-graphite-900">Total: ${totalDamages.toLocaleString()}</span>
          </div>
          {matter.damages.length === 0 ? (
            <EmptyState title="No damages recorded" description="Itemized damages for this matter will appear here." />
          ) : (
            <table className="data-table">
              <thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
              <tbody>
                {matter.damages.map((d) => (
                  <tr key={d.id}>
                    <td>{d.category}</td>
                    <td>{d.description}</td>
                    <td>${d.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "activity" && (
        <Card>
          <h2 className="font-semibold text-graphite-900 text-sm mb-3">Activity Log</h2>
          {matterActivity.length === 0 ? (
            <EmptyState title="No related activity found" description="This shows firm activity log entries that reference this matter by name or ID." />
          ) : (
            <ul className="space-y-2">
              {matterActivity.map((a) => (
                <li key={a.id} className="text-sm border-b border-graphite-100 pb-2">
                  <p className="text-graphite-700">{a.message}</p>
                  <p className="text-xs text-graphite-400">{a.actor} · {new Date(a.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
