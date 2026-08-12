"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button, ProgressBar, StatCard, EmptyState, InfoBanner, Modal } from "@/components/ui";
import { PI_STAGES, EMPLOYMENT_STAGES, CaseChangeCategory, CalendarEventType } from "@/lib/types";
import { useAppState } from "@/lib/store";

export type MatterTab =
  | "overview"
  | "documents"
  | "changes"
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
  { key: "changes", label: "Changes", href: (id) => `/matters/${id}?tab=changes` },
  { key: "timeline", label: "Timeline", href: (id) => `/matters/${id}/timeline` },
  { key: "tasks", label: "Tasks", href: (id) => `/matters/${id}/tasks` },
  { key: "communications", label: "Communications", href: (id) => `/matters/${id}/communications` },
  { key: "billing", label: "Billing", href: (id) => `/matters/${id}/billing` },
  { key: "client", label: "Client", href: (id) => `/matters/${id}?tab=client` },
  { key: "calendar", label: "Case Calendar", href: (id) => `/matters/${id}?tab=calendar` },
  { key: "notes", label: "Notes", href: (id) => `/matters/${id}?tab=notes` },
  { key: "parties", label: "Parties", href: (id) => `/matters/${id}?tab=parties` },
  { key: "damages", label: "Damages", href: (id) => `/matters/${id}?tab=damages` },
  { key: "activity", label: "Activity Log", href: (id) => `/matters/${id}?tab=activity` },
];

const CALENDAR_EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: "client_meeting", label: "Meeting with client" },
  { value: "mediation", label: "Mediation" },
  { value: "hearing", label: "Hearing" },
  { value: "trial", label: "Trial" },
  { value: "discovery", label: "Discovery deadline" },
  { value: "filing_deadline", label: "Filing deadline" },
  { value: "court_deadline", label: "Court deadline" },
  { value: "limitation_period", label: "Limitation period" },
  { value: "medical_appointment", label: "Medical appointment" },
  { value: "consultation", label: "Consultation" },
  { value: "internal_review", label: "Internal review" },
  { value: "follow_up", label: "Follow-up" },
];

const CHANGE_CATEGORIES: { value: CaseChangeCategory; label: string }[] = [
  { value: "documents", label: "Documents" },
  { value: "status", label: "Case status" },
  { value: "stage", label: "Case stage" },
  { value: "deadline", label: "Deadline" },
  { value: "communication", label: "Communication" },
  { value: "other", label: "Other" },
];

function riskTone(risk: string): "green" | "amber" | "red" {
  if (risk === "at_risk") return "red";
  if (risk === "attention") return "amber";
  return "green";
}

export function MatterWorkspace({ matterId, activeTab }: { matterId: string; activeTab: MatterTab }) {
  const {
    getMatter, clients, team, tasks, communications, calendarEvents, activityLog, caseChanges, clientUpdates,
    addMatterNote, addMatterDocument, addCommunication, addTask, updateTaskStatus, updateMatterStage,
    toggleDocumentClientVisible, markDocumentUpdated, notifyClientOfDocumentUpdate, toggleCommunicationClientVisible,
    logCaseChange, draftClientUpdateMessage, sendClientUpdate,
    addCaseCalendarEvent, shareCalendarEventWithClient, updateCaseCalendarEvent, syncCalendarEventUpdate, cancelCaseCalendarEvent,
  } = useAppState();

  const [noteBody, setNoteBody] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newCommBody, setNewCommBody] = useState("");
  const [commMode, setCommMode] = useState<"secure_message" | "internal_comment">("secure_message");
  const [commClientVisible, setCommClientVisible] = useState(true);

  const [newDocName, setNewDocName] = useState("");
  const [newDocConfidentiality, setNewDocConfidentiality] = useState<"standard" | "confidential" | "privileged" | "internal_only">("standard");
  const [newDocClientVisible, setNewDocClientVisible] = useState(true);

  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState("");

  // --- Feature 1: Case Change -> Client Update ---
  const [changeSummary, setChangeSummary] = useState("");
  const [changeDetail, setChangeDetail] = useState("");
  const [changeCategory, setChangeCategory] = useState<CaseChangeCategory>("documents");
  const [changeInternalOnly, setChangeInternalOnly] = useState(false);
  const [caseUpdatedModalChangeId, setCaseUpdatedModalChangeId] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewChangeId, setReviewChangeId] = useState<string | null>(null);
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState<{ deliveryStatus: string; sentAt: string } | null>(null);

  // --- Feature 2: Shared Case Calendar ---
  const [addDateModalOpen, setAddDateModalOpen] = useState(false);
  const [dateTitle, setDateTitle] = useState("");
  const [dateType, setDateType] = useState<CalendarEventType>("client_meeting");
  const [dateDate, setDateDate] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [dateDescription, setDateDescription] = useState("");
  const [dateLocation, setDateLocation] = useState("");
  const [dateInternalNotes, setDateInternalNotes] = useState("");
  const [shareDateModalEventId, setShareDateModalEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [updateClientModalEventId, setUpdateClientModalEventId] = useState<string | null>(null);
  const [cancelModalEventId, setCancelModalEventId] = useState<string | null>(null);
  const [bridgeNotice, setBridgeNotice] = useState<string | null>(null);

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
  const matterEvents = calendarEvents.filter((e) => e.matterId === matter.id && !e.cancelled);
  const cancelledMatterEvents = calendarEvents.filter((e) => e.matterId === matter.id && e.cancelled);
  const matterChanges = caseChanges.filter((c) => c.matterId === matter.id);
  const openTasks = matterTasks.filter((t) => t.status !== "complete" && t.status !== "cancelled");
  const clientUploads = matter.documents.filter((d) => d.fromClient);

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
      type: commMode,
      from: "Sarah Kim",
      to: client?.fullName ?? "Client",
      subject: commMode === "secure_message" ? "Secure update" : "Case note",
      body: newCommBody.trim(),
      teamMemberId: "tm-1",
      clientVisible: commMode === "secure_message" ? commClientVisible : undefined,
    });
    setNewCommBody("");
  }

  function handleAddDocument() {
    if (!newDocName.trim()) return;
    addMatterDocument(matter!.id, {
      name: newDocName.trim(),
      folder: "General",
      category: "General",
      uploadedBy: "Sarah Kim",
      confidentiality: newDocConfidentiality,
      clientVisible: newDocClientVisible,
      tags: [],
      sizeLabel: "—",
    });
    setNewDocName("");
    setNewDocConfidentiality("standard");
    setNewDocClientVisible(true);
  }

  function handleLogClientUpload() {
    addMatterDocument(matter!.id, {
      name: `client_upload_${new Date().toISOString().slice(0, 10)}.jpg`,
      folder: "Client Uploads",
      category: "Photo/Video",
      uploadedBy: client?.fullName ?? "Client",
      confidentiality: "standard",
      clientVisible: true,
      tags: ["from-client"],
      sizeLabel: "—",
      fromClient: true,
    });
  }

  function handleMarkUpdated(docId: string) {
    setUpdatingDocId(docId);
    setUpdateNote("");
  }

  function handleConfirmUpdate(docId: string) {
    if (!updateNote.trim()) return;
    markDocumentUpdated(matter!.id, docId, updateNote.trim());
    setUpdatingDocId(null);
    setUpdateNote("");
  }

  // --- Feature 1 handlers: Case Change -> Client Update ---

  function handleSaveChange() {
    if (!changeSummary.trim()) return;
    const entry = logCaseChange(matter!.id, {
      summary: changeSummary.trim(),
      detail: changeDetail.trim(),
      category: changeCategory,
      internalOnly: changeInternalOnly,
    });
    setChangeSummary("");
    setChangeDetail("");
    setChangeCategory("documents");
    setChangeInternalOnly(false);
    if (!entry.internalOnly) {
      setCaseUpdatedModalChangeId(entry.id);
    }
  }

  function handlePrepareClientUpdate() {
    if (!caseUpdatedModalChangeId) return;
    const draft = draftClientUpdateMessage(matter!.id, [caseUpdatedModalChangeId]);
    setReviewMessage(draft);
    setReviewChangeId(caseUpdatedModalChangeId);
    setCaseUpdatedModalChangeId(null);
    setReviewModalOpen(true);
  }

  function handleRegenerate() {
    if (!reviewChangeId) return;
    setReviewMessage(draftClientUpdateMessage(matter!.id, [reviewChangeId]));
  }

  async function handleSendToClient() {
    if (!reviewChangeId || !reviewMessage.trim()) return;
    setSendingUpdate(true);
    const result = await sendClientUpdate(matter!.id, [reviewChangeId], reviewMessage.trim());
    setSendingUpdate(false);
    setReviewModalOpen(false);
    setReviewChangeId(null);
    setSentConfirmation({ deliveryStatus: result.deliveryStatus, sentAt: new Date().toISOString() });
  }

  // --- Feature 2 handlers: Shared Case Calendar ---

  function handleOpenAddDate() {
    setDateTitle("");
    setDateType("client_meeting");
    setDateDate("");
    setDateTime("");
    setDateDescription("");
    setDateLocation("");
    setDateInternalNotes("");
    setAddDateModalOpen(true);
  }

  function handleSaveDate() {
    if (!dateTitle.trim() || !dateDate) return;
    const event = addCaseCalendarEvent(matter!.id, {
      title: dateTitle.trim(),
      type: dateType,
      date: dateDate,
      time: dateTime,
      description: dateDescription.trim(),
      location: dateLocation.trim() || undefined,
      internalNotes: dateInternalNotes.trim() || undefined,
    });
    setAddDateModalOpen(false);
    setShareDateModalEventId(event.id);
  }

  async function handleShareDate(share: boolean) {
    const eventId = shareDateModalEventId;
    setShareDateModalEventId(null);
    if (!eventId || !share) return;
    const result = await shareCalendarEventWithClient(matter!.id, eventId);
    setBridgeNotice(result.ok ? "Shared with the client's JusticeChamp Important Dates calendar." : `Could not reach JusticeChamp: ${result.error ?? "delivery failed"}`);
  }

  function handleStartEditEvent(eventId: string) {
    const event = calendarEvents.find((e) => e.id === eventId);
    if (!event) return;
    setEditingEventId(eventId);
    setEditDate(event.date);
    setEditTime(event.time);
  }

  function handleSaveEditEvent() {
    if (!editingEventId) return;
    const event = calendarEvents.find((e) => e.id === editingEventId);
    updateCaseCalendarEvent(matter!.id, editingEventId, { date: editDate, time: editTime });
    setEditingEventId(null);
    if (event?.sharedWithClient) {
      setUpdateClientModalEventId(editingEventId);
    }
  }

  async function handleUpdateClient(update: boolean) {
    const eventId = updateClientModalEventId;
    setUpdateClientModalEventId(null);
    if (!eventId || !update) return;
    const result = await syncCalendarEventUpdate(matter!.id, eventId);
    setBridgeNotice(result.ok ? "Client's JusticeChamp calendar updated." : `Could not reach JusticeChamp: ${result.error ?? "delivery failed"}`);
  }

  async function handleCancelEvent(notify: boolean) {
    const eventId = cancelModalEventId;
    setCancelModalEventId(null);
    if (!eventId) return;
    const result = await cancelCaseCalendarEvent(matter!.id, eventId, notify);
    if (notify && result) {
      setBridgeNotice(result.ok ? "Client notified of cancellation." : `Could not reach JusticeChamp: ${result.error ?? "delivery failed"}`);
    }
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
        <div className="space-y-4">
          {clientUploads.length > 0 && (
            <Card className="border-teal-200">
              <h2 className="font-semibold text-graphite-900 text-sm mb-1">Client uploads ({clientUploads.length})</h2>
              <p className="text-xs text-graphite-500 mb-3">
                Documents, photos, and videos the client sent from their JusticeChamp app appear here.
              </p>
              <ul className="space-y-2">
                {clientUploads.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm border-b border-graphite-100 pb-2">
                    <div>
                      <p className="font-medium text-graphite-900">{d.name}</p>
                      <p className="text-xs text-graphite-500">From {d.uploadedBy} · {new Date(d.uploadedAt).toLocaleString()}</p>
                    </div>
                    <Badge tone="teal">From client</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="font-semibold text-graphite-900 text-sm">Documents ({matter.documents.length})</h2>
              <Button size="sm" variant="ghost" onClick={handleLogClientUpload}>
                Simulate: client sent a file
              </Button>
            </div>

            <div className="rounded-lg bg-graphite-50 border border-graphite-100 p-3 mb-4 space-y-2">
              <p className="text-xs font-medium text-graphite-700">Add a document to this matter</p>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Document name"
                  className="flex-1 min-w-[160px] rounded-lg border border-graphite-200 px-3 py-2 text-sm"
                />
                <select
                  value={newDocConfidentiality}
                  onChange={(e) => setNewDocConfidentiality(e.target.value as typeof newDocConfidentiality)}
                  className="rounded-lg border border-graphite-200 px-2 py-2 text-sm"
                >
                  <option value="standard">Standard</option>
                  <option value="confidential">Confidential</option>
                  <option value="privileged">Privileged</option>
                  <option value="internal_only">Internal only</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-graphite-600 whitespace-nowrap">
                  <input type="checkbox" checked={newDocClientVisible} onChange={(e) => setNewDocClientVisible(e.target.checked)} />
                  Visible to client
                </label>
                <Button size="sm" onClick={handleAddDocument} disabled={!newDocName.trim()}>Add document</Button>
              </div>
            </div>

            {matter.documents.length === 0 ? (
              <EmptyState title="No documents yet" description="Documents uploaded for this matter will appear here." />
            ) : (
              <ul className="space-y-2">
                {matter.documents.map((d) => (
                  <li key={d.id} className="border border-graphite-100 rounded-lg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-graphite-900">{d.name}</p>
                        <p className="text-xs text-graphite-500">{d.folder} · {d.category} · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge tone={d.confidentiality === "privileged" ? "red" : d.confidentiality === "confidential" ? "amber" : "gray"}>{d.confidentiality}</Badge>
                        {d.fromClient && <Badge tone="teal">From client</Badge>}
                        <Badge tone={d.clientVisible ? "green" : "gray"}>{d.clientVisible ? "Client can view" : "Redacted from client"}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => toggleDocumentClientVisible(matter.id, d.id)}>
                        {d.clientVisible ? "Redact from client" : "Share with client"}
                      </Button>
                      {updatingDocId === d.id ? (
                        <div className="flex flex-1 min-w-[240px] gap-2 items-center">
                          <input
                            value={updateNote}
                            onChange={(e) => setUpdateNote(e.target.value)}
                            placeholder="What changed?"
                            className="flex-1 rounded-lg border border-graphite-200 px-2 py-1.5 text-xs"
                          />
                          <Button size="sm" onClick={() => handleConfirmUpdate(d.id)} disabled={!updateNote.trim()}>Save update</Button>
                          <Button size="sm" variant="ghost" onClick={() => setUpdatingDocId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleMarkUpdated(d.id)}>Mark as updated</Button>
                      )}
                    </div>
                    {d.updatedPendingClientNotice && (
                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                        <p className="text-xs text-amber-900">
                          This file was updated{d.lastUpdateNote ? `: "${d.lastUpdateNote}"` : "."} Send the client a note that it changed?
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => notifyClientOfDocumentUpdate(matter.id, d.id, true)}>Yes, notify client</Button>
                          <Button size="sm" variant="ghost" onClick={() => notifyClientOfDocumentUpdate(matter.id, d.id, false)}>No, don't notify</Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === "changes" && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-graphite-900 text-sm mb-1">Log a case change</h2>
            <p className="text-xs text-graphite-500 mb-3">
              Record a meaningful change to this case. Unless marked internal-only, saving will offer to prepare a
              plain-language client update — nothing is sent until you review and approve it.
            </p>
            <div className="space-y-2">
              <input
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="What changed? (e.g. Defendant's insurer provided additional documents)"
                className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm"
              />
              <textarea
                value={changeDetail}
                onChange={(e) => setChangeDetail(e.target.value)}
                placeholder="Internal detail (may include privileged/strategy notes — never shared with the client)"
                rows={2}
                className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap items-center gap-3">
                <select value={changeCategory} onChange={(e) => setChangeCategory(e.target.value as CaseChangeCategory)} className="rounded-lg border border-graphite-200 px-2 py-2 text-sm">
                  {CHANGE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-xs text-graphite-600">
                  <input type="checkbox" checked={changeInternalOnly} onChange={(e) => setChangeInternalOnly(e.target.checked)} />
                  Internal only — never eligible for a client update
                </label>
                <Button size="sm" onClick={handleSaveChange} disabled={!changeSummary.trim()}>Save change</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-graphite-900 text-sm mb-3">Case changes ({matterChanges.length})</h2>
            {matterChanges.length === 0 ? (
              <EmptyState title="No case changes logged" description="Meaningful changes you log for this case will appear here." />
            ) : (
              <ul className="space-y-3">
                {matterChanges.map((c) => {
                  const linkedUpdate = clientUpdates.find((u) => u.id === c.clientUpdateId);
                  return (
                    <li key={c.id} className="border-b border-graphite-100 pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-graphite-900">{c.summary}</p>
                        <div className="flex gap-1.5">
                          <Badge tone="gray">{c.category.replace(/_/g, " ")}</Badge>
                          {c.internalOnly && <Badge tone="red">Internal only</Badge>}
                          {linkedUpdate && <Badge tone="green">Client update sent</Badge>}
                        </div>
                      </div>
                      {c.detail && <p className="text-xs text-graphite-500 mt-1">{c.detail}</p>}
                      <p className="text-xs text-graphite-400 mt-1">{c.createdBy} · {new Date(c.createdAt).toLocaleString()}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
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
          <h2 className="font-semibold text-graphite-900 text-sm mb-1">Communications ({matterComms.length})</h2>
          <p className="text-xs text-graphite-500 mb-3">
            Secure messages are recorded here and delivered to the client's JusticeChamp app once sent. You can redact
            a message from client view at any time. To send a plain-language case update backed by an AI draft and
            review step, use the Changes tab.
          </p>

          <div className="rounded-lg bg-graphite-50 border border-graphite-100 p-3 mb-4 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setCommMode("secure_message")}
                className={`text-xs px-3 py-1.5 rounded-full border ${commMode === "secure_message" ? "bg-graphite-900 text-white border-graphite-900" : "border-graphite-200 text-graphite-600"}`}
              >
                Message to client
              </button>
              <button
                onClick={() => setCommMode("internal_comment")}
                className={`text-xs px-3 py-1.5 rounded-full border ${commMode === "internal_comment" ? "bg-graphite-900 text-white border-graphite-900" : "border-graphite-200 text-graphite-600"}`}
              >
                Internal note
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={newCommBody}
                onChange={(e) => setNewCommBody(e.target.value)}
                placeholder={commMode === "secure_message" ? "Write a confidential update for the client…" : "Log a note or message"}
                className="flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm"
              />
              <Button size="sm" onClick={handleAddComm}>{commMode === "secure_message" ? "Send" : "Log"}</Button>
            </div>
            {commMode === "secure_message" && (
              <label className="flex items-center gap-1.5 text-xs text-graphite-600">
                <input type="checkbox" checked={commClientVisible} onChange={(e) => setCommClientVisible(e.target.checked)} />
                Client can view this message (uncheck to keep it in the file without sending — you can share it later)
              </label>
            )}
          </div>

          {matterComms.length === 0 ? (
            <EmptyState title="No communications logged" description="Messages, calls, and notes for this matter will appear here." />
          ) : (
            <ul className="space-y-3">
              {matterComms.map((c) => (
                <li key={c.id} className="text-sm border-b border-graphite-100 pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-graphite-900 font-medium">{c.subject}</p>
                    {c.type === "secure_message" && (
                      <Badge tone={c.clientVisible === false ? "gray" : "green"}>{c.clientVisible === false ? "Redacted — internal only" : "Client can view"}</Badge>
                    )}
                  </div>
                  <p className="text-graphite-600">{c.body}</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
                    <p className="text-xs text-graphite-400">{c.from} → {c.to} · {new Date(c.createdAt).toLocaleString()}</p>
                    {c.type === "secure_message" && (
                      <button className="text-xs text-teal-600 hover:underline" onClick={() => toggleCommunicationClientVisible(c.id)}>
                        {c.clientVisible === false ? "Restore client access" : "Redact from client"}
                      </button>
                    )}
                  </div>
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
        <div className="space-y-4">
          {bridgeNotice && (
            <InfoBanner tone="teal">
              {bridgeNotice}
              <button className="ml-2 text-xs underline" onClick={() => setBridgeNotice(null)}>Dismiss</button>
            </InfoBanner>
          )}
          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="font-semibold text-graphite-900 text-sm">Case Calendar ({matterEvents.length})</h2>
              <Button size="sm" onClick={handleOpenAddDate}>+ Add Important Date</Button>
            </div>
            {matterEvents.length === 0 ? (
              <EmptyState title="No calendar events" description="Deadlines and meetings for this matter will appear here." />
            ) : (
              <ul className="space-y-2">
                {matterEvents.map((e) => (
                  <li key={e.id} className="border border-graphite-100 rounded-lg p-3">
                    {editingEventId === e.id ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <input type="date" value={editDate} onChange={(ev) => setEditDate(ev.target.value)} className="rounded-lg border border-graphite-200 px-2 py-1.5 text-xs" />
                          <input type="time" value={editTime} onChange={(ev) => setEditTime(ev.target.value)} className="rounded-lg border border-graphite-200 px-2 py-1.5 text-xs" />
                          <Button size="sm" onClick={handleSaveEditEvent}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingEventId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-graphite-900">{e.title}</p>
                          <div className="flex gap-1.5">
                            <Badge tone="gray">{e.type.replace(/_/g, " ")}</Badge>
                            {e.sharedWithClient ? <Badge tone="green">Shared with client</Badge> : <Badge tone="amber">Internal</Badge>}
                            {e.clientSyncStatus === "update_pending" && <Badge tone="red">Client update pending</Badge>}
                          </div>
                        </div>
                        <p className="text-xs text-graphite-500 mt-1">{e.date}{e.time ? ` at ${e.time}` : ""}{e.location ? ` · ${e.location}` : ""}</p>
                        {e.description && <p className="text-xs text-graphite-600 mt-1">{e.description}</p>}
                        {e.internalNotes && (
                          <p className="text-xs text-graphite-400 mt-1 italic">Internal note (never shared): {e.internalNotes}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleStartEditEvent(e.id)}>Edit date/time</Button>
                          {!e.sharedWithClient && (
                            <Button size="sm" variant="outline" onClick={() => setShareDateModalEventId(e.id)}>Share with client</Button>
                          )}
                          {e.clientSyncStatus === "update_pending" && (
                            <Button size="sm" onClick={() => setUpdateClientModalEventId(e.id)}>Sync update to client</Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => setCancelModalEventId(e.id)}>Cancel date</Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {cancelledMatterEvents.length > 0 && (
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Cancelled dates ({cancelledMatterEvents.length})</h2>
              <ul className="space-y-2">
                {cancelledMatterEvents.map((e) => (
                  <li key={e.id} className="text-sm border-b border-graphite-100 pb-2 opacity-70">
                    <p className="font-medium text-graphite-900 line-through">{e.title}</p>
                    <p className="text-xs text-graphite-500">{e.date}{e.time ? ` at ${e.time}` : ""} · {e.sharedWithClient ? (e.cancelledNotifiedClient ? "Client notified" : "Client not notified") : "Was internal only"}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
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

      {/* Feature 1: Case Change -> Client Update modals */}
      <Modal open={!!caseUpdatedModalChangeId} onClose={() => setCaseUpdatedModalChangeId(null)} title="Case Updated" width="sm">
        <p className="text-sm text-graphite-600 mb-4">Would you like JusticeIQ to summarize these changes and prepare an update for the client?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setCaseUpdatedModalChangeId(null)}>No — do not share</Button>
          <Button onClick={handlePrepareClientUpdate}>Yes — prepare client update</Button>
        </div>
      </Modal>

      <Modal open={reviewModalOpen} onClose={() => { setReviewModalOpen(false); setReviewChangeId(null); }} title="Review Client Update" width="md">
        <textarea
          value={reviewMessage}
          onChange={(e) => setReviewMessage(e.target.value)}
          rows={9}
          className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm mb-3"
        />
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="ghost" onClick={handleRegenerate}>Regenerate</Button>
          <Button variant="outline" onClick={() => { setReviewModalOpen(false); setReviewChangeId(null); }}>Cancel</Button>
          <Button onClick={handleSendToClient} disabled={sendingUpdate || !reviewMessage.trim()}>
            {sendingUpdate ? "Sending…" : "Send to client"}
          </Button>
        </div>
      </Modal>

      <Modal open={!!sentConfirmation} onClose={() => setSentConfirmation(null)} title="Client Update Sent" width="sm">
        {sentConfirmation?.deliveryStatus === "sent" ? (
          <p className="text-sm text-graphite-600 mb-4">The update has been added to the client's JusticeChamp Notices.</p>
        ) : (
          <p className="text-sm text-red-600 mb-4">The update was saved to this case, but delivery to JusticeChamp failed. Make sure the JusticeChamp app is running, then try sending again from the Changes tab.</p>
        )}
        <ul className="text-xs text-graphite-500 space-y-1 mb-4">
          <li>Date: {new Date(sentConfirmation?.sentAt ?? Date.now()).toLocaleDateString()}</li>
          <li>Time: {new Date(sentConfirmation?.sentAt ?? Date.now()).toLocaleTimeString()}</li>
          <li>Client: {client?.fullName ?? "—"}</li>
          <li>Case: {matter.matterName}</li>
          <li>Sending lawyer: Sarah Kim</li>
          <li>Delivery status: {sentConfirmation?.deliveryStatus}</li>
        </ul>
        <div className="flex justify-end">
          <Button onClick={() => setSentConfirmation(null)}>Done</Button>
        </div>
      </Modal>

      {/* Feature 2: Shared Case Calendar modals */}
      <Modal open={addDateModalOpen} onClose={() => setAddDateModalOpen(false)} title="Add Case Date" width="md">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs text-graphite-600">
              Date
              <input type="date" value={dateDate} onChange={(e) => setDateDate(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-graphite-600">
              Time (optional)
              <input type="time" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="text-xs text-graphite-600 block">
            Event
            <input value={dateTitle} onChange={(e) => setDateTitle(e.target.value)} placeholder="Discovery Deadline" className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-graphite-600 block">
            Event type
            <select value={dateType} onChange={(e) => setDateType(e.target.value as CalendarEventType)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm">
              {CALENDAR_EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-graphite-600 block">
            Description
            <textarea value={dateDescription} onChange={(e) => setDateDescription(e.target.value)} rows={2} placeholder="Documents must be exchanged between the parties by this date." className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-graphite-600 block">
            Location / Meeting Link (optional)
            <input value={dateLocation} onChange={(e) => setDateLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-graphite-600 block">
            Internal Notes (optional — never automatically shared with the client)
            <textarea value={dateInternalNotes} onChange={(e) => setDateInternalNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setAddDateModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDate} disabled={!dateTitle.trim() || !dateDate}>Save date</Button>
        </div>
      </Modal>

      <Modal open={!!shareDateModalEventId} onClose={() => setShareDateModalEventId(null)} title="Date Added" width="sm">
        <p className="text-sm text-graphite-600 mb-4">Would you like to share this important date with the client?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => handleShareDate(false)}>No — keep internal</Button>
          <Button onClick={() => handleShareDate(true)}>Yes — share with client</Button>
        </div>
      </Modal>

      <Modal open={!!updateClientModalEventId} onClose={() => setUpdateClientModalEventId(null)} title="Update Client?" width="sm">
        <p className="text-sm text-graphite-600 mb-4">This date was previously shared with the client. Would you like to update the client's JusticeChamp calendar?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => handleUpdateClient(false)}>No — keep client version</Button>
          <Button onClick={() => handleUpdateClient(true)}>Yes — update client</Button>
        </div>
      </Modal>

      <Modal open={!!cancelModalEventId} onClose={() => setCancelModalEventId(null)} title="Notify Client of Cancellation?" width="sm">
        {(() => {
          const event = calendarEvents.find((e) => e.id === cancelModalEventId);
          if (!event?.sharedWithClient) {
            return (
              <>
                <p className="text-sm text-graphite-600 mb-4">This date was never shared with the client. Cancel it internally?</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setCancelModalEventId(null)}>Back</Button>
                  <Button variant="danger" onClick={() => handleCancelEvent(false)}>Cancel date</Button>
                </div>
              </>
            );
          }
          return (
            <>
              <p className="text-sm text-graphite-600 mb-4">This date was shared with the client. Cancel it and notify them?</p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => handleCancelEvent(false)}>No — do not change client calendar</Button>
                <Button variant="danger" onClick={() => handleCancelEvent(true)}>Yes — cancel and notify client</Button>
              </div>
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
