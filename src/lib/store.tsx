"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityLogItem, CalendarEvent, Client, ClaimCategory, Communication, Consultation, ConsultationMeetingType,
  Contact, DeclineReason, Firm, Matter, MatterDocument, MatterNote, MatterParty, MatterTask, Notification,
  Referral, ReferralNote, TeamMember,
} from "./types";
import {
  ACTIVITY_LOG, CALENDAR_EVENTS, CLIENTS, COMMUNICATIONS, CONTACTS, FIRM, MATTERS, NOTIFICATIONS, REFERRALS,
  TASKS, TEAM,
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
}

function emptyState(): AppState {
  return { isAuthenticated: false, firm: null, team: [], referrals: [], matters: [], clients: [], contacts: [], tasks: [], calendarEvents: [], communications: [], notifications: [], activityLog: [] };
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
    }),
    [
      state, hydrated, currentUser, loginDemo, login, signup, logout, getReferral, getMatter, updateReferralStatus,
      assignLawyer, addReferralNote, declineReferral, runConflictCheck, scheduleConsultation, recordConsultationOutcome,
      convertReferralToMatter, addTask, updateTaskStatus, addMatterNote, addMatterDocument, addCommunication,
      toggleCommunicationClientVisible, toggleDocumentClientVisible, markDocumentUpdated, notifyClientOfDocumentUpdate,
      updateMatterStage, markNotificationRead, logActivity,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
