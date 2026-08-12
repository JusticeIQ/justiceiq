"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityLogItem, BridgeDeliveryResult, CalendarEvent, CalendarEventType, CaseChangeCategory, CaseChangeEntry,
  Client, ClaimCategory, ClientUpdate, Communication, Consultation, ConsultationMeetingType, Contact, DeclineReason,
  Firm, Matter, MatterDocument, MatterNote, MatterParty, MatterTask, Notification, Referral, ReferralNote,
  TeamMember,
} from "./types";
import {
  ACTIVITY_LOG, CALENDAR_EVENTS, CASE_CHANGES, CLIENTS, CLIENT_UPDATES, COMMUNICATIONS, CONTACTS, FIRM, MATTERS,
  NOTIFICATIONS, REFERRALS, TASKS, TEAM,
} from "./demo-data";

const STORAGE_KEY = "justiceiq-demo-state-v1";
const CURRENT_USER_ID = "tm-1";

interface AppState {
  isAuthenticated: boolean;
  firm: Firm | null;
  team: TeamMember[];
  referrals: Referral[];
  matters: Matter[];
  clients: Client[];
  contacts: Contact[];
  tasks: MatterTask[];
  calendarEvents: CalendarEvent[];
  communications: Communication[];
  notifications: Notification[];
  activityLog: ActivityLogItem[];
  caseChanges: CaseChangeEntry[];
  clientUpdates: ClientUpdate[];
}

function emptyState(): AppState {
  return { isAuthenticated: false, firm: null, team: [], referrals: [], matters: [], clients: [], contacts: [], tasks: [], calendarEvents: [], communications: [], notifications: [], activityLog: [], caseChanges: [], clientUpdates: [] };
}

function seededState(): AppState {
  return {
    isAuthenticated: true,
    firm: FIRM,
    team: TEAM,
    referrals: REFERRALS,
    matters: MATTERS,
    clients: CLIENTS,
    contacts: CONTACTS,
    tasks: TASKS,
    calendarEvents: CALENDAR_EVENTS,
    communications: COMMUNICATIONS,
    notifications: NOTIFICATIONS,
    activityLog: ACTIVITY_LOG,
    caseChanges: CASE_CHANGES,
    clientUpdates: CLIENT_UPDATES,
  };
}

interface AppContextValue extends AppState {
  hydrated: boolean;
  currentUserId: string;
  currentUser: TeamMember | undefined;
  loginDemo: () => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (firmName: string, email: string, password: string, confirmPassword: string) => { ok: boolean; error?: string };
  logout: () => void;
  getReferral: (id: string) => Referral | undefined;
  getMatter: (id: string) => Matter | undefined;
  updateReferralStatus: (id: string, status: Referral["status"]) => void;
  assignLawyer: (referralId: string, lawyerId: string) => void;
  addReferralNote: (referralId: string, body: string) => void;
  declineReferral: (referralId: string, reason: DeclineReason, detail: string) => void;
  runConflictCheck: (referralId: string) => void;
  scheduleConsultation: (referralId: string, data: { proposedTimes: string[]; lawyerId: string; meetingType: ConsultationMeetingType; preparationInstructions: string }) => void;
  recordConsultationOutcome: (referralId: string, outcome: Consultation["outcome"], notes: string) => void;
  convertReferralToMatter: (referralId: string, input: { matterName: string; responsibleLawyerId: string; teamMemberIds: string[]; clientName: string; clientEmail: string; jurisdiction: string; stage: string }) => string;
  addTask: (task: Omit<MatterTask, "id">) => void;
  updateTaskStatus: (taskId: string, status: MatterTask["status"]) => void;
  addMatterNote: (matterId: string, body: string) => void;
  addMatterDocument: (matterId: string, doc: Omit<MatterDocument, "id" | "uploadedAt">) => void;
  addCommunication: (comm: Omit<Communication, "id" | "createdAt">) => void;
  toggleCommunicationClientVisible: (commId: string) => void;
  toggleDocumentClientVisible: (matterId: string, docId: string) => void;
  markDocumentUpdated: (matterId: string, docId: string, note: string) => void;
  notifyClientOfDocumentUpdate: (matterId: string, docId: string, notify: boolean) => void;
  updateMatterStage: (matterId: string, stage: string) => void;
  markNotificationRead: (id: string) => void;
  logActivity: (message: string) => void;
  logCaseChange: (matterId: string, input: { summary: string; detail: string; category: CaseChangeCategory; internalOnly: boolean }) => CaseChangeEntry;
  draftClientUpdateMessage: (matterId: string, changeIds: string[]) => string;
  sendClientUpdate: (matterId: string, changeIds: string[], message: string) => Promise<BridgeDeliveryResult>;
  addCaseCalendarEvent: (matterId: string, input: { title: string; type: CalendarEventType; date: string; time: string; description: string; location?: string; internalNotes?: string }) => CalendarEvent;
  shareCalendarEventWithClient: (matterId: string, eventId: string) => Promise<BridgeDeliveryResult>;
  updateCaseCalendarEvent: (matterId: string, eventId: string, updates: Partial<Pick<CalendarEvent, "title" | "date" | "time" | "description" | "location" | "internalNotes">>) => void;
  syncCalendarEventUpdate: (matterId: string, eventId: string) => Promise<BridgeDeliveryResult>;
  cancelCaseCalendarEvent: (matterId: string, eventId: string, notifyClient: boolean) => Promise<BridgeDeliveryResult | void>;
}

// Lightweight, deterministic "AI drafting" for client-facing case update language.
// This never has access to internal notes, strategy, or privileged fields — only
// the plain-language summary/category the lawyer entered for a non-internal change.
function changeSummaryToClientSentence(change: CaseChangeEntry): string {
  switch (change.category) {
    case "documents":
      return `${change.summary}, and your lawyer has updated your file to reflect this new information.`;
    case "status":
      return `The status of your case has changed: ${change.summary}.`;
    case "stage":
      return `Your case has moved forward: ${change.summary}.`;
    case "deadline":
      return `There's an update on an upcoming deadline in your case: ${change.summary}.`;
    case "communication":
      return `Your legal team has an update to share: ${change.summary}.`;
    default:
      return `${change.summary}.`;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
  }, [state, hydrated]);

  const logActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activityLog: [{ id: `act-${Date.now()}`, message, timestamp: new Date().toISOString(), actor: "Sarah Kim" }, ...prev.activityLog].slice(0, 80),
    }));
  }, []);

  const loginDemo = useCallback(() => setState(seededState()), []);

  const login = useCallback((email: string, password: string) => {
    if (!email || !password) return { ok: false, error: "Enter both email and password." };
    setState(seededState());
    return { ok: true };
  }, []);

  const signup = useCallback((firmName: string, email: string, password: string, confirmPassword: string) => {
    if (!firmName || !email || !password) return { ok: false, error: "Please complete all required fields." };
    if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };
    setState(seededState());
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setState(emptyState());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }, []);

  const getReferral = useCallback((id: string) => state.referrals.find((r) => r.id === id), [state.referrals]);
  const getMatter = useCallback((id: string) => state.matters.find((m) => m.id === id), [state.matters]);

  const updateReferralStatus = useCallback(
    (id: string, status: Referral["status"]) => {
      setState((prev) => ({ ...prev, referrals: prev.referrals.map((r) => (r.id === id ? { ...r, status, lastActivityAt: new Date().toISOString() } : r)) }));
      logActivity(`Updated referral ${id} status to "${status.replace(/_/g, " ")}"`);
    },
    [logActivity]
  );

  const assignLawyer = useCallback(
    (referralId: string, lawyerId: string) => {
      setState((prev) => ({ ...prev, referrals: prev.referrals.map((r) => (r.id === referralId ? { ...r, assignedLawyerId: lawyerId, lastActivityAt: new Date().toISOString() } : r)) }));
      logActivity(`Assigned referral ${referralId} to a lawyer`);
    },
    [logActivity]
  );

  const addReferralNote = useCallback((referralId: string, body: string) => {
    setState((prev) => ({
      ...prev,
      referrals: prev.referrals.map((r) => {
        if (r.id !== referralId) return r;
        const note: ReferralNote = { id: `rn-${Date.now()}`, authorId: CURRENT_USER_ID, authorName: "Sarah Kim", body, createdAt: new Date().toISOString(), visibility: "internal" };
        return { ...r, notes: [note, ...r.notes], lastActivityAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const declineReferral = useCallback(
    (referralId: string, reason: DeclineReason, detail: string) => {
      setState((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => (r.id === referralId ? { ...r, status: "declined", declineReason: reason, declineDetail: detail, lastActivityAt: new Date().toISOString() } : r)),
      }));
      logActivity(`Declined referral ${referralId} (${reason})`);
    },
    [logActivity]
  );

  const runConflictCheck = useCallback(
    (referralId: string) => {
      setState((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => {
          if (r.id !== referralId) return r;
          const hasNameCollision = prev.matters.some((m) => m.parties.some((p) => r.conflictCheck.entities.some((e) => e.role !== "consumer" && e.name === p.name)));
          const resultStatus = hasNameCollision ? "potential_conflict" : "clear";
          return {
            ...r,
            conflictCheck: {
              status: resultStatus,
              runAt: new Date().toISOString(),
              runBy: "Sarah Kim",
              entities: r.conflictCheck.entities.map((e) => ({ ...e, status: e.role === "consumer" ? "clear" : resultStatus })),
            },
            lastActivityAt: new Date().toISOString(),
          };
        }),
      }));
      logActivity(`Ran conflict check on referral ${referralId}`);
    },
    [logActivity]
  );

  const scheduleConsultation = useCallback(
    (referralId: string, data: { proposedTimes: string[]; lawyerId: string; meetingType: ConsultationMeetingType; preparationInstructions: string }) => {
      setState((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => {
          if (r.id !== referralId) return r;
          const consultation: Consultation = {
            id: `cons-${Date.now()}`, referralId, proposedTimes: data.proposedTimes, confirmedTime: data.proposedTimes[0],
            lawyerId: data.lawyerId, meetingType: data.meetingType, preparationInstructions: data.preparationInstructions, status: "confirmed",
          };
          return { ...r, consultation, status: "consultation_scheduled", lastActivityAt: new Date().toISOString() };
        }),
        calendarEvents: [
          { id: `cal-${Date.now()}`, matterId: null, referralId, title: `Consultation \u2014 ${prev.referrals.find((r) => r.id === referralId)?.consumerName ?? "Referral"}`, type: "consultation", date: data.proposedTimes[0]?.slice(0, 10) ?? "", time: data.proposedTimes[0]?.slice(11, 16) ?? "09:00", lawyerId: data.lawyerId, description: data.preparationInstructions },
          ...prev.calendarEvents,
        ],
      }));
      logActivity(`Scheduled consultation for referral ${referralId}`);
    },
    [logActivity]
  );

  const recordConsultationOutcome = useCallback(
    (referralId: string, outcome: Consultation["outcome"], notes: string) => {
      setState((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => (r.id === referralId && r.consultation ? { ...r, consultation: { ...r.consultation, status: "completed", outcome, outcomeNotes: notes } } : r)),
      }));
      logActivity(`Recorded consultation outcome for referral ${referralId}: ${outcome}`);
    },
    [logActivity]
  );

  const convertReferralToMatter = useCallback(
    (referralId: string, input: { matterName: string; responsibleLawyerId: string; teamMemberIds: string[]; clientName: string; clientEmail: string; jurisdiction: string; stage: string }) => {
      const referral = state.referrals.find((r) => r.id === referralId);
      const matterId = `matter-${Date.now()}`;
      const clientId = `client-${Date.now()}`;
      const matterNumber = `${referral?.category === "employment" ? "EMP" : "PI"}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

      const newClient: Client = {
        id: clientId, fullName: input.clientName, email: input.clientEmail, phone: "", address: "",
        relationshipOwnerId: input.responsibleLawyerId, portalStatus: "invited",
        consentHistory: [{ label: "Engagement letter signed", date: new Date().toISOString().slice(0, 10), granted: true }],
      };

      const newMatter: Matter = {
        id: matterId, matterNumber, sourceReferralId: referralId, clientId, matterName: input.matterName,
        category: referral?.category ?? "personal_injury", practiceArea: referral?.category === "employment" ? "Employment Law" : "Personal Injury",
        responsibleLawyerId: input.responsibleLawyerId, teamMemberIds: input.teamMemberIds, stage: input.stage, status: "active",
        openDate: new Date().toISOString().slice(0, 10), nextDeadline: referral?.potentialDeadlineConcerns ? null : null,
        nextDeadlineLabel: referral?.potentialDeadlineConcerns ?? "", lastActivityAt: new Date().toISOString(), riskStatus: "on_track",
        caseGoals: referral?.consumerObjectives ?? "", nextRecommendedAction: "Send engagement letter and begin initial case work.",
        retainerStatus: "pending", consentStatus: "granted", clientPortalStatus: "invited", jurisdiction: input.jurisdiction,
        parties: [{ id: `mp-${Date.now()}`, name: input.clientName, role: "client", contactInfo: input.clientEmail }],
        timeline: referral?.timeline.map((t) => ({ ...t, id: `mt-${t.id}` })) ?? [],
        documents: referral?.documents.map((d) => ({
          id: `md-${d.id}`, name: d.name, folder: "Intake", category: d.category, uploadedBy: "Imported from JusticeChamp",
          uploadedAt: d.uploadedAt, confidentiality: "standard" as const, clientVisible: true, tags: [], sizeLabel: "\u2014",
        })) ?? [],
        notes: referral?.notes.map((n) => ({ id: `mn-${n.id}`, authorName: n.authorName, body: n.body, createdAt: n.createdAt })) ?? [],
        damages: [],
      };

      setState((prev) => ({
        ...prev,
        matters: [newMatter, ...prev.matters],
        clients: [newClient, ...prev.clients],
        referrals: prev.referrals.map((r) => (r.id === referralId ? { ...r, status: "converted", convertedMatterId: matterId, lastActivityAt: new Date().toISOString() } : r)),
      }));
      logActivity(`Converted referral ${referralId} to matter ${matterNumber}`);
      return matterId;
    },
    [state.referrals, logActivity]
  );

  const addTask = useCallback(
    (task: Omit<MatterTask, "id">) => {
      setState((prev) => ({ ...prev, tasks: [{ ...task, id: `task-${Date.now()}` }, ...prev.tasks] }));
      logActivity(`Created task: ${task.title}`);
    },
    [logActivity]
  );

  const updateTaskStatus = useCallback((taskId: string, status: MatterTask["status"]) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status, completionDate: status === "complete" ? new Date().toISOString().slice(0, 10) : t.completionDate } : t)),
    }));
  }, []);

  const addMatterNote = useCallback((matterId: string, body: string) => {
    setState((prev) => ({
      ...prev,
      matters: prev.matters.map((m) => {
        if (m.id !== matterId) return m;
        const note: MatterNote = { id: `mn-${Date.now()}`, authorName: "Sarah Kim", body, createdAt: new Date().toISOString() };
        return { ...m, notes: [note, ...m.notes], lastActivityAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const addMatterDocument = useCallback(
    (matterId: string, doc: Omit<MatterDocument, "id" | "uploadedAt">) => {
      setState((prev) => ({
        ...prev,
        matters: prev.matters.map((m) => (m.id === matterId ? { ...m, documents: [{ ...doc, id: `md-${Date.now()}`, uploadedAt: new Date().toISOString() }, ...m.documents], lastActivityAt: new Date().toISOString() } : m)),
      }));
      logActivity(`Uploaded document to matter ${matterId}: ${doc.name}`);
    },
    [logActivity]
  );

  const addCommunication = useCallback((comm: Omit<Communication, "id" | "createdAt">) => {
    setState((prev) => ({ ...prev, communications: [{ ...comm, id: `comm-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev.communications] }));
  }, []);

  const toggleCommunicationClientVisible = useCallback((commId: string) => {
    setState((prev) => ({
      ...prev,
      communications: prev.communications.map((c) => (c.id === commId ? { ...c, clientVisible: c.clientVisible === false ? true : false } : c)),
    }));
    logActivity(`Changed client visibility on a secure message`);
  }, [logActivity]);

  const toggleDocumentClientVisible = useCallback(
    (matterId: string, docId: string) => {
      setState((prev) => ({
        ...prev,
        matters: prev.matters.map((m) =>
          m.id !== matterId ? m : { ...m, documents: m.documents.map((d) => (d.id === docId ? { ...d, clientVisible: !d.clientVisible } : d)) }
        ),
      }));
      logActivity(`Changed client visibility on a document in matter ${matterId}`);
    },
    [logActivity]
  );

  const markDocumentUpdated = useCallback(
    (matterId: string, docId: string, note: string) => {
      setState((prev) => ({
        ...prev,
        matters: prev.matters.map((m) =>
          m.id !== matterId
            ? m
            : {
                ...m,
                documents: m.documents.map((d) =>
                  d.id === docId ? { ...d, updatedPendingClientNotice: true, lastUpdatedAt: new Date().toISOString(), lastUpdateNote: note } : d
                ),
              }
        ),
      }));
      logActivity(`Updated a document in matter ${matterId}`);
    },
    [logActivity]
  );

  const notifyClientOfDocumentUpdate = useCallback(
    (matterId: string, docId: string, notify: boolean) => {
      setState((prev) => {
        const matter = prev.matters.find((m) => m.id === matterId);
        const doc = matter?.documents.find((d) => d.id === docId);
        const client = prev.clients.find((c) => c.id === matter?.clientId);
        const nextMatters = prev.matters.map((m) =>
          m.id !== matterId
            ? m
            : { ...m, documents: m.documents.map((d) => (d.id === docId ? { ...d, updatedPendingClientNotice: false } : d)) }
        );
        if (!notify || !matter || !doc) {
          return { ...prev, matters: nextMatters };
        }
        const comm: Communication = {
          id: `comm-${Date.now()}`,
          matterId,
          referralId: null,
          clientId: matter.clientId,
          type: "secure_message",
          from: "Sarah Kim",
          to: client?.fullName ?? "Client",
          subject: `File updated: ${doc.name}`,
          body: doc.lastUpdateNote || "This file in your matter was updated.",
          createdAt: new Date().toISOString(),
          teamMemberId: CURRENT_USER_ID,
          clientVisible: true,
        };
        return { ...prev, matters: nextMatters, communications: [comm, ...prev.communications] };
      });
      logActivity(notify ? `Notified client of a file update in matter ${matterId}` : `Updated a file in matter ${matterId} without notifying the client`);
    },
    [logActivity]
  );

  const updateMatterStage = useCallback(
    (matterId: string, stage: string) => {
      setState((prev) => ({ ...prev, matters: prev.matters.map((m) => (m.id === matterId ? { ...m, stage, lastActivityAt: new Date().toISOString() } : m)) }));
      logActivity(`Updated matter ${matterId} stage to "${stage}"`);
    },
    [logActivity]
  );

  // --- Feature 1: Case Change -> Client Update -----------------------------

  const logCaseChange = useCallback(
    (matterId: string, input: { summary: string; detail: string; category: CaseChangeCategory; internalOnly: boolean }) => {
      const entry: CaseChangeEntry = {
        id: `cc-${Date.now()}`,
        matterId,
        summary: input.summary,
        detail: input.detail,
        category: input.category,
        internalOnly: input.internalOnly,
        createdBy: "Sarah Kim",
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        caseChanges: [entry, ...prev.caseChanges],
        matters: prev.matters.map((m) => (m.id === matterId ? { ...m, lastActivityAt: new Date().toISOString() } : m)),
      }));
      logActivity(`Case updated on matter ${matterId}: ${input.summary}`);
      return entry;
    },
    [logActivity]
  );

  const draftClientUpdateMessage = useCallback(
    (matterId: string, changeIds: string[]) => {
      const changes = state.caseChanges.filter((c) => changeIds.includes(c.id) && !c.internalOnly);
      const lead =
        changes.length === 1
          ? changeSummaryToClientSentence(changes[0])
          : "There have been updates to your case.";
      return [
        "Case Update",
        "",
        lead,
        "",
        "No action is required from you at this time.",
        "",
        "Your legal team will continue reviewing the information and will contact you if anything further is required.",
      ].join("\n");
    },
    [state.caseChanges]
  );

  const sendClientUpdate = useCallback(
    async (matterId: string, changeIds: string[], message: string): Promise<BridgeDeliveryResult> => {
      const matter = state.matters.find((m) => m.id === matterId);
      const client = state.clients.find((c) => c.id === matter?.clientId);
      const updateId = `cu-${Date.now()}`;
      const sentAt = new Date().toISOString();

      let result: BridgeDeliveryResult;
      try {
        const res = await fetch("/api/bridge/notices", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            caseId: matterId,
            caseName: matter?.matterName ?? "Case",
            clientRef: matter?.clientId ?? "",
            subject: "Case Update",
            message,
            sendingLawyer: "Sarah Kim",
            firmName: "JusticeIQ Demo Firm",
            sentAt,
          }),
        });
        result = await res.json();
      } catch (err) {
        result = { ok: false, deliveryStatus: "failed", error: err instanceof Error ? err.message : "Unknown error" };
      }

      const clientUpdate: ClientUpdate = {
        id: updateId,
        matterId,
        clientId: matter?.clientId ?? "",
        caseChangeIds: changeIds,
        subject: "Case Update",
        message,
        sendingLawyer: "Sarah Kim",
        sentAt,
        deliveryStatus: result.deliveryStatus,
      };

      setState((prev) => ({
        ...prev,
        clientUpdates: [clientUpdate, ...prev.clientUpdates],
        caseChanges: prev.caseChanges.map((c) => (changeIds.includes(c.id) ? { ...c, clientUpdateId: updateId } : c)),
        communications:
          result.ok
            ? [
                {
                  id: `comm-${Date.now()}`,
                  matterId,
                  referralId: null,
                  clientId: matter?.clientId ?? null,
                  type: "secure_message",
                  from: "Sarah Kim",
                  to: client?.fullName ?? "Client",
                  subject: "Case Update",
                  body: message,
                  createdAt: sentAt,
                  teamMemberId: CURRENT_USER_ID,
                  clientVisible: true,
                },
                ...prev.communications,
              ]
            : prev.communications,
      }));

      logActivity(
        result.ok
          ? `Sent client update to ${client?.fullName ?? "client"} for matter ${matterId}`
          : `Client update for matter ${matterId} failed to deliver (${result.error ?? "delivery error"})`
      );

      return result;
    },
    [state.matters, state.clients, logActivity]
  );

  // --- Feature 2: Shared Case Calendar --------------------------------------

  const addCaseCalendarEvent = useCallback(
    (matterId: string, input: { title: string; type: CalendarEventType; date: string; time: string; description: string; location?: string; internalNotes?: string }) => {
      const event: CalendarEvent = {
        id: `cal-${Date.now()}`,
        matterId,
        referralId: null,
        title: input.title,
        type: input.type,
        date: input.date,
        time: input.time || "09:00",
        lawyerId: CURRENT_USER_ID,
        description: input.description,
        location: input.location,
        internalNotes: input.internalNotes,
        sharedWithClient: false,
        clientSyncStatus: "internal",
      };
      setState((prev) => ({
        ...prev,
        calendarEvents: [event, ...prev.calendarEvents],
        matters: prev.matters.map((m) => (m.id === matterId ? { ...m, lastActivityAt: new Date().toISOString() } : m)),
      }));
      logActivity(`Added case calendar date "${input.title}" to matter ${matterId}`);
      return event;
    },
    [logActivity]
  );

  const shareCalendarEventWithClient = useCallback(
    async (matterId: string, eventId: string): Promise<BridgeDeliveryResult> => {
      const matter = state.matters.find((m) => m.id === matterId);
      const event = state.calendarEvents.find((e) => e.id === eventId);
      if (!event) return { ok: false, deliveryStatus: "failed", error: "Event not found" };

      let result: BridgeDeliveryResult;
      try {
        const res = await fetch("/api/bridge/important-dates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "create",
            id: event.id,
            caseId: matterId,
            caseName: matter?.matterName ?? "Case",
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description,
            location: event.location ?? "",
          }),
        });
        result = await res.json();
      } catch (err) {
        result = { ok: false, deliveryStatus: "failed", error: err instanceof Error ? err.message : "Unknown error" };
      }

      setState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.map((e) =>
          e.id === eventId
            ? { ...e, sharedWithClient: result.ok, clientSyncStatus: result.ok ? "shared" : "internal", lastSharedAt: result.ok ? new Date().toISOString() : e.lastSharedAt }
            : e
        ),
      }));
      logActivity(
        result.ok
          ? `Shared important date "${event.title}" with client for matter ${matterId}`
          : `Failed to share important date "${event.title}" with client (${result.error ?? "delivery error"})`
      );
      return result;
    },
    [state.matters, state.calendarEvents, logActivity]
  );

  const updateCaseCalendarEvent = useCallback(
    (matterId: string, eventId: string, updates: Partial<Pick<CalendarEvent, "title" | "date" | "time" | "description" | "location" | "internalNotes">>) => {
      setState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.map((e) =>
          e.id === eventId ? { ...e, ...updates, clientSyncStatus: e.sharedWithClient ? "update_pending" : e.clientSyncStatus } : e
        ),
      }));
      logActivity(`Updated case calendar date for matter ${matterId}`);
    },
    [logActivity]
  );

  const syncCalendarEventUpdate = useCallback(
    async (matterId: string, eventId: string): Promise<BridgeDeliveryResult> => {
      const matter = state.matters.find((m) => m.id === matterId);
      const event = state.calendarEvents.find((e) => e.id === eventId);
      if (!event) return { ok: false, deliveryStatus: "failed", error: "Event not found" };

      let result: BridgeDeliveryResult;
      try {
        const res = await fetch("/api/bridge/important-dates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "update",
            id: event.id,
            caseId: matterId,
            caseName: matter?.matterName ?? "Case",
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description,
            location: event.location ?? "",
          }),
        });
        result = await res.json();
      } catch (err) {
        result = { ok: false, deliveryStatus: "failed", error: err instanceof Error ? err.message : "Unknown error" };
      }

      setState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.map((e) =>
          e.id === eventId ? { ...e, clientSyncStatus: result.ok ? "shared" : e.clientSyncStatus, lastSharedAt: result.ok ? new Date().toISOString() : e.lastSharedAt } : e
        ),
      }));
      logActivity(
        result.ok
          ? `Updated shared client calendar for "${event.title}" (matter ${matterId})`
          : `Failed to sync updated date "${event.title}" to client (${result.error ?? "delivery error"})`
      );
      return result;
    },
    [state.matters, state.calendarEvents, logActivity]
  );

  const cancelCaseCalendarEvent = useCallback(
    async (matterId: string, eventId: string, notifyClient: boolean): Promise<BridgeDeliveryResult | void> => {
      const matter = state.matters.find((m) => m.id === matterId);
      const event = state.calendarEvents.find((e) => e.id === eventId);
      if (!event) return;

      const wasShared = !!event.sharedWithClient;

      if (!notifyClient || !wasShared) {
        setState((prev) => ({
          ...prev,
          calendarEvents: prev.calendarEvents.map((e) => (e.id === eventId ? { ...e, cancelled: true } : e)),
        }));
        logActivity(`Cancelled case calendar date "${event.title}" for matter ${matterId}${wasShared ? " (client calendar not changed)" : ""}`);
        return;
      }

      let result: BridgeDeliveryResult;
      try {
        const res = await fetch("/api/bridge/important-dates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "cancel",
            id: event.id,
            caseId: matterId,
            caseName: matter?.matterName ?? "Case",
            title: event.title,
            date: event.date,
          }),
        });
        result = await res.json();
      } catch (err) {
        result = { ok: false, deliveryStatus: "failed", error: err instanceof Error ? err.message : "Unknown error" };
      }

      setState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.map((e) =>
          e.id === eventId ? { ...e, cancelled: true, cancelledNotifiedClient: result.ok } : e
        ),
      }));
      logActivity(
        result.ok
          ? `Notified client of cancellation of "${event.title}" (matter ${matterId})`
          : `Failed to notify client of cancellation of "${event.title}" (${result.error ?? "delivery error"})`
      );
      return result;
    },
    [state.matters, state.calendarEvents, logActivity]
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  }, []);

  const currentUser = state.team.find((t) => t.id === CURRENT_USER_ID);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      currentUserId: CURRENT_USER_ID,
      currentUser,
      loginDemo,
      login,
      signup,
      logout,
      getReferral,
      getMatter,
      updateReferralStatus,
      assignLawyer,
      addReferralNote,
      declineReferral,
      runConflictCheck,
      scheduleConsultation,
      recordConsultationOutcome,
      convertReferralToMatter,
      addTask,
      updateTaskStatus,
      addMatterNote,
      addMatterDocument,
      addCommunication,
      toggleCommunicationClientVisible,
      toggleDocumentClientVisible,
      markDocumentUpdated,
      notifyClientOfDocumentUpdate,
      updateMatterStage,
      markNotificationRead,
      logActivity,
      logCaseChange,
      draftClientUpdateMessage,
      sendClientUpdate,
      addCaseCalendarEvent,
      shareCalendarEventWithClient,
      updateCaseCalendarEvent,
      syncCalendarEventUpdate,
      cancelCaseCalendarEvent,
    }),
    [
      state, hydrated, currentUser, loginDemo, login, signup, logout, getReferral, getMatter, updateReferralStatus,
      assignLawyer, addReferralNote, declineReferral, runConflictCheck, scheduleConsultation, recordConsultationOutcome,
      convertReferralToMatter, addTask, updateTaskStatus, addMatterNote, addMatterDocument, addCommunication,
      toggleCommunicationClientVisible, toggleDocumentClientVisible, markDocumentUpdated, notifyClientOfDocumentUpdate,
      updateMatterStage, markNotificationRead, logActivity, logCaseChange, draftClientUpdateMessage, sendClientUpdate,
      addCaseCalendarEvent, shareCalendarEventWithClient, updateCaseCalendarEvent, syncCalendarEventUpdate,
      cancelCaseCalendarEvent,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
