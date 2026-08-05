"use client";

import { Badge } from "./ui";
import { ConflictStatus, ReferralStatus, TaskPriority, TaskStatus, UrgencyLevel } from "@/lib/types";

const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  new: "New",
  under_review: "Under Review",
  more_info_requested: "More Info Requested",
  consultation_requested: "Consultation Requested",
  consultation_scheduled: "Consultation Scheduled",
  accepted: "Accepted",
  declined: "Declined",
  conflict: "Conflict",
  referred_elsewhere: "Referred Elsewhere",
  converted: "Converted to Matter",
};
const REFERRAL_STATUS_TONE: Record<ReferralStatus, "teal" | "navy" | "amber" | "gray" | "red" | "green"> = {
  new: "teal",
  under_review: "amber",
  more_info_requested: "amber",
  consultation_requested: "navy",
  consultation_scheduled: "navy",
  accepted: "green",
  declined: "gray",
  conflict: "red",
  referred_elsewhere: "gray",
  converted: "green",
};

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  return <Badge tone={REFERRAL_STATUS_TONE[status]}>{REFERRAL_STATUS_LABEL[status]}</Badge>;
}
export const REFERRAL_STATUSES: ReferralStatus[] = ["new", "under_review", "more_info_requested", "consultation_requested", "consultation_scheduled", "accepted", "declined", "conflict", "referred_elsewhere", "converted"];

const URGENCY_TONE: Record<UrgencyLevel, "teal" | "amber" | "red"> = { low: "teal", moderate: "amber", high: "red" };
export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  return <Badge tone={URGENCY_TONE[level]}>{level} urgency</Badge>;
}

const CONFLICT_LABEL: Record<ConflictStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  clear: "Clear",
  potential_conflict: "Potential Conflict",
  conflict_confirmed: "Conflict Confirmed",
};
const CONFLICT_TONE: Record<ConflictStatus, "teal" | "navy" | "amber" | "gray" | "red" | "green"> = {
  not_started: "gray",
  in_progress: "amber",
  clear: "green",
  potential_conflict: "amber",
  conflict_confirmed: "red",
};
export function ConflictStatusBadge({ status }: { status: ConflictStatus }) {
  return <Badge tone={CONFLICT_TONE[status]}>{CONFLICT_LABEL[status]}</Badge>;
}

const TASK_STATUS_LABEL: Record<TaskStatus, string> = { not_started: "Not Started", in_progress: "In Progress", waiting: "Waiting", complete: "Complete", cancelled: "Cancelled" };
const TASK_STATUS_TONE: Record<TaskStatus, "teal" | "navy" | "amber" | "gray" | "red" | "green"> = { not_started: "gray", in_progress: "navy", waiting: "amber", complete: "green", cancelled: "gray" };
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={TASK_STATUS_TONE[status]}>{TASK_STATUS_LABEL[status]}</Badge>;
}

const PRIORITY_TONE: Record<TaskPriority, "teal" | "navy" | "amber" | "gray" | "red" | "green"> = { low: "gray", normal: "teal", high: "amber", urgent: "red" };
export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>;
}
