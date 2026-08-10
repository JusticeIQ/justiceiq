// Core domain types for the JusticeIQ lawyer portal MVP.
// Mirrors supabase/schema.sql so the demo data layer and a future
// production data layer share one shape. Types prefixed "Claim" model
// data that originates in the connected JusticeChamp consumer app.

export type ClaimCategory = "personal_injury" | "employment";

export type UserRole =
  | "firm_admin"
  | "partner"
  | "lawyer"
  | "paralegal"
  | "intake_coordinator"
  | "legal_assistant"
  | "read_only_analyst";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  title: string;
  practiceAreas: ClaimCategory[];
  jurisdictions: string[];
  languages: string[];
  active: boolean;
  avatarInitials: string;
  capacity: number;
  createdAt: string;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  jurisdiction: string;
}

export interface Firm {
  id: string;
  name: string;
  practiceAreas: ClaimCategory[];
  jurisdictions: string[];
  offices: Office[];
  firmSize: string;
  primaryAdministratorId: string;
  languages: string[];
  minimumCaseCriteria: string;
  conflictScreeningProcedure: string;
  consultationAvailability: string;
  notificationPreferences: string[];
  subscriptionTier: SubscriptionTierId;
  createdAt: string;
}

export type ReferralStatus =
  | "new"
  | "under_review"
  | "more_info_requested"
  | "consultation_requested"
  | "consultation_scheduled"
  | "accepted"
  | "declined"
  | "conflict"
  | "referred_elsewhere"
  | "converted";

export type UrgencyLevel = "low" | "moderate" | "high";

export interface ClaimAssessment {
  claimReadiness: number;
  informationCompleteness: number;
  evidenceStrength: number;
  timelineClarity: number;
  documentAvailability: number;
  urgency: UrgencyLevel;
  aiConfidence: number;
  identifiedUncertainties: string[];
  suggestedConsultationQuestions: string[];
}

export interface ReferralDocument {
  id: string;
  name: string;
  category: string;
  description: string;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  peopleInvolved: string;
  significance: "low" | "medium" | "high";
}

export interface ReferralNote {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  visibility: "internal" | "team";
}

export type ConflictStatus = "not_started" | "in_progress" | "clear" | "potential_conflict" | "conflict_confirmed";

export interface ConflictCheckEntity {
  name: string;
  role: "consumer" | "opposing_party" | "employer" | "insurer" | "witness" | "related_organization";
  status: ConflictStatus;
}

export interface ConflictCheck {
  status: ConflictStatus;
  entities: ConflictCheckEntity[];
  runAt?: string;
  runBy?: string;
}

export type ConsultationMeetingType = "phone" | "video" | "in_person";
export type ConsultationOutcome = "retained" | "follow_up_required" | "declined_by_firm" | "declined_by_consumer" | "referred_elsewhere" | "pending_documents";

export interface Consultation {
  id: string;
  referralId: string;
  proposedTimes: string[];
  confirmedTime?: string;
  lawyerId: string;
  meetingType: ConsultationMeetingType;
  preparationInstructions: string;
  status: "proposed" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  outcome?: ConsultationOutcome;
  outcomeNotes?: string;
}

export const DECLINE_REASONS = [
  "Outside jurisdiction",
  "Outside practice area",
  "Conflict",
  "Insufficient capacity",
  "Claim does not meet firm criteria",
  "Other",
] as const;
export type DeclineReason = typeof DECLINE_REASONS[number];

export interface Referral {
  id: string;
  source: "JusticeChamp Consumer Intake" | "Direct" | "Partner firm";
  sourceClaimId?: string;
  consumerName: string;
  consumerAnonymizedId: string;
  category: ClaimCategory;
  subtype: string;
  jurisdiction: string;
  incidentDate: string;
  submittedAt: string;
  status: ReferralStatus;
  assignedLawyerId: string | null;
  responseDeadline: string;
  matchExplanation: string;
  consumerObjectives: string;
  assessment: ClaimAssessment;
  incidentOverview: string;
  keyDates: { label: string; date: string }[];
  parties: string;
  chronology: string;
  injuriesOrConsequences: string;
  medicalTreatmentOrWorkplaceResponse: string;
  financialLosses: string;
  witnesses: string;
  documents: ReferralDocument[];
  timeline: TimelineEvent[];
  missingInformation: string[];
  potentialDeadlineConcerns: string;
  notes: ReferralNote[];
  conflictCheck: ConflictCheck;
  consultation: Consultation | null;
  declineReason: DeclineReason | null;
  declineDetail: string;
  convertedMatterId: string | null;
  consentToShare: boolean;
  lastActivityAt: string;
}

export type MatterStatus = "active" | "on_hold" | "closed";

export const PI_STAGES = ["Intake", "Investigation", "Medical Documentation", "Insurance Negotiation", "Pleadings", "Discovery", "Mediation", "Pre-Trial", "Trial", "Resolution", "Closed"] as const;
export const EMPLOYMENT_STAGES = ["Intake", "Document Review", "Demand or Negotiation", "Administrative Process", "Pleadings", "Discovery", "Mediation", "Hearing or Trial", "Resolution", "Closed"] as const;

export interface MatterParty {
  id: string;
  name: string;
  role: "client" | "opposing_party" | "employer" | "insurer" | "defence_lawyer" | "witness" | "medical_provider" | "expert" | "other";
  contactInfo: string;
}

export interface MatterNote {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface MatterDocument {
  id: string;
  name: string;
  folder: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  confidentiality: "standard" | "confidential" | "privileged" | "internal_only";
  clientVisible: boolean;
  tags: string[];
  sizeLabel: string;
  fromClient?: boolean;
  updatedPendingClientNotice?: boolean;
  lastUpdatedAt?: string;
  lastUpdateNote?: string;
}

export type TaskStatus = "not_started" | "in_progress" | "waiting" | "complete" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface MatterTask {
  id: string;
  matterId: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  checklist: { label: string; done: boolean }[];
  dependency?: string;
  reminder?: string;
  relatedDocumentId?: string;
  createdBy: string;
  completionDate?: string;
}

export type CalendarEventType = "consultation" | "limitation_period" | "court_deadline" | "filing_deadline" | "medical_appointment" | "client_meeting" | "discovery" | "mediation" | "hearing" | "trial" | "internal_review" | "follow_up";

export interface CalendarEvent {
  id: string;
  matterId: string | null;
  referralId: string | null;
  title: string;
  type: CalendarEventType;
  date: string;
  time: string;
  lawyerId: string;
  description: string;
}

export interface DamageItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export type CommunicationType = "secure_message" | "email_log" | "phone_note" | "consultation_note" | "internal_comment" | "document_request" | "automated_reminder";

export interface Communication {
  id: string;
  matterId: string | null;
  referralId: string | null;
  clientId: string | null;
  type: CommunicationType;
  from: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
  teamMemberId: string;
  clientVisible?: boolean;
}

export interface Matter {
  id: string;
  matterNumber: string;
  sourceReferralId: string | null;
  clientId: string;
  matterName: string;
  category: ClaimCategory;
  practiceArea: string;
  responsibleLawyerId: string;
  teamMemberIds: string[];
  stage: string;
  status: MatterStatus;
  openDate: string;
  nextDeadline: string | null;
  nextDeadlineLabel: string;
  lastActivityAt: string;
  riskStatus: "on_track" | "attention" | "at_risk";
  caseGoals: string;
  nextRecommendedAction: string;
  retainerStatus: "not_signed" | "signed" | "pending";
  consentStatus: "granted" | "pending" | "declined";
  clientPortalStatus: "not_created" | "invited" | "active";
  parties: MatterParty[];
  timeline: TimelineEvent[];
  documents: MatterDocument[];
  notes: MatterNote[];
  damages: DamageItem[];
  jurisdiction: string;
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  relationshipOwnerId: string;
  portalStatus: "not_created" | "invited" | "active";
  consentHistory: { label: string; date: string; granted: boolean }[];
}

export interface Contact {
  id: string;
  name: string;
  organization: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  jurisdiction: string;
  relatedMatterIds: string[];
  notes: string;
  communicationPreference: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "referral" | "deadline" | "task" | "message" | "system";
  createdAt: string;
  read: boolean;
}

export interface ActivityLogItem {
  id: string;
  message: string;
  timestamp: string;
  actor: string;
}

export type SubscriptionTierId = "basic" | "bronze" | "silver" | "gold" | "platinum";

export interface SubscriptionTier {
  id: SubscriptionTierId;
  name: string;
  monthlyPrice: number;
  users: string;
  referrals: string;
  activeMatters: string;
  storage: string;
  aiAssistance: boolean;
  workflowAutomation: boolean;
  advancedReporting: boolean;
  integrations: boolean;
  support: string;
  multiOffice: boolean;
  customIntakeCriteria: boolean;
  businessIntelligence: boolean;
}

export interface TaskTemplateItem {
  id: string;
  name: string;
  appliesTo: ClaimCategory | "both";
  tasks: string[];
}
