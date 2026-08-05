"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs, BackButton } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState, InfoBanner } from "@/components/ui";
import { ReferralStatusBadge, UrgencyBadge, ConflictStatusBadge } from "@/components/StatusBadges";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { useAppState } from "@/lib/store";
import { DECLINE_REASONS, DeclineReason, ConsultationMeetingType } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = { personal_injury: "Personal Injury", employment: "Employment Law" };

export default function ReferralReviewPage() {
  const params = useParams<{ referralId: string }>();
  const router = useRouter();
  const {
    getReferral, team, updateReferralStatus, assignLawyer, addReferralNote, declineReferral, runConflictCheck,
    scheduleConsultation, recordConsultationOutcome, convertReferralToMatter,
  } = useAppState();
  const referral = getReferral(params.referralId);

  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState<DeclineReason>("Outside jurisdiction");
  const [declineDetail, setDeclineDetail] = useState("");

  const [showConsultForm, setShowConsultForm] = useState(false);
  const [consultDate, setConsultDate] = useState("2026-08-08");
  const [consultTime, setConsultTime] = useState("15:00");
  const [consultLawyer, setConsultLawyer] = useState(referral?.assignedLawyerId ?? team[1]?.id ?? "");
  const [consultType, setConsultType] = useState<ConsultationMeetingType>("video");
  const [consultPrep, setConsultPrep] = useState("Please bring any relevant documents and be ready to discuss the timeline of events.");

  const [showConvert, setShowConvert] = useState(false);
  const [matterName, setMatterName] = useState(referral ? `${referral.consumerName} — ${referral.subtype}` : "");
  const [responsibleLawyer, setResponsibleLawyer] = useState(referral?.assignedLawyerId ?? team[1]?.id ?? "");
  const [supportingTeam, setSupportingTeam] = useState<string[]>([]);
  const [matterStage, setMatterStage] = useState("Intake");

  const [noteBody, setNoteBody] = useState("");

  if (!referral) {
    return (
      <AppShell>
        <EmptyState title="Referral not found" description="This referral may not exist in the demo dataset." action={<Link href="/referrals"><Button>Back to Referrals</Button></Link>} />
      </AppShell>
    );
  }

  function lawyerName(id: string | null) {
    if (!id) return "Unassigned";
    return team.find((t) => t.id === id)?.fullName ?? "Unknown";
  }

  function handleDeclineSubmit() {
    declineReferral(referral!.id, declineReason, declineDetail);
    setShowDecline(false);
  }

  function handleScheduleSubmit() {
    scheduleConsultation(referral!.id, {
      proposedTimes: [`${consultDate}T${consultTime}:00Z`],
      lawyerId: consultLawyer,
      meetingType: consultType,
      preparationInstructions: consultPrep,
    });
    setShowConsultForm(false);
  }

  function handleConvertSubmit() {
    const matterId = convertReferralToMatter(referral!.id, {
      matterName, responsibleLawyerId: responsibleLawyer, teamMemberIds: [responsibleLawyer, ...supportingTeam],
      clientName: referral!.consumerName, clientEmail: `${referral!.consumerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      jurisdiction: referral!.jurisdiction, stage: matterStage,
    });
    setShowConvert(false);
    router.push(`/matters/${matterId}`);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "New Referrals", href: "/referrals" }, { label: referral.consumerAnonymizedId }]} />
        <BackButton href="/referrals" label="Back to Referral Pipeline" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone={referral.category === "personal_injury" ? "teal" : "navy"}>{CATEGORY_LABEL[referral.category]}</Badge>
              <ReferralStatusBadge status={referral.status} />
              <UrgencyBadge level={referral.assessment.urgency} />
            </div>
            <h1 className="text-2xl font-bold text-graphite-900 mt-2">{referral.subtype} — {referral.consumerAnonymizedId}</h1>
            <p className="text-sm text-graphite-500 mt-1">Source: {referral.source} {referral.sourceClaimId && `· Claim ID ${referral.sourceClaimId}`}</p>
          </div>
          <Card className="text-center shrink-0">
            <p className="text-3xl font-bold text-teal-600">{referral.assessment.claimReadiness}</p>
            <p className="text-[11px] text-graphite-500">claim-readiness score</p>
          </Card>
        </div>

        <InfoBanner tone="amber">
          The claim assessment below originates from JusticeChamp Consumer Intake as preliminary intake analysis. It is not
          legal advice and does not replace the firm's own evaluation, conflict screening, or professional judgment.
        </InfoBanner>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Referral overview</h2>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-xs text-graphite-500">Claim type</dt><dd className="text-graphite-900">{referral.subtype}</dd></div>
                <div><dt className="text-xs text-graphite-500">Jurisdiction</dt><dd className="text-graphite-900">{referral.jurisdiction}</dd></div>
                <div><dt className="text-xs text-graphite-500">Incident date</dt><dd className="text-graphite-900">{referral.incidentDate}</dd></div>
                <div><dt className="text-xs text-graphite-500">Date submitted</dt><dd className="text-graphite-900">{new Date(referral.submittedAt).toLocaleString()}</dd></div>
                <div><dt className="text-xs text-graphite-500">AI confidence level</dt><dd className="text-graphite-900">{referral.assessment.aiConfidence}%</dd></div>
                <div><dt className="text-xs text-graphite-500">Assigned lawyer</dt><dd className="text-graphite-900">{lawyerName(referral.assignedLawyerId)}</dd></div>
              </dl>
              <div className="mt-4">
                <dt className="text-xs text-graphite-500">Consumer objectives</dt>
                <dd className="text-sm text-graphite-900 mt-1">{referral.consumerObjectives}</dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-graphite-500">Match rationale</dt>
                <dd className="text-sm text-graphite-900 mt-1">{referral.matchExplanation}</dd>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Structured claim summary</h2>
              <div className="space-y-4 text-sm">
                <div><p className="text-xs text-graphite-500">Incident overview</p><p className="text-graphite-900 mt-1">{referral.incidentOverview}</p></div>
                <div>
                  <p className="text-xs text-graphite-500">Key dates</p>
                  <ul className="mt-1 space-y-1">
                    {referral.keyDates.map((d) => <li key={d.label} className="text-graphite-900">{d.label}: {d.date}</li>)}
                  </ul>
                </div>
                <div><p className="text-xs text-graphite-500">Parties involved</p><p className="text-graphite-900 mt-1">{referral.parties}</p></div>
                <div><p className="text-xs text-graphite-500">Chronology</p><p className="text-graphite-900 mt-1">{referral.chronology}</p></div>
                <div><p className="text-xs text-graphite-500">Injuries / employment consequences</p><p className="text-graphite-900 mt-1">{referral.injuriesOrConsequences}</p></div>
                <div><p className="text-xs text-graphite-500">Medical treatment / workplace response</p><p className="text-graphite-900 mt-1">{referral.medicalTreatmentOrWorkplaceResponse}</p></div>
                <div><p className="text-xs text-graphite-500">Financial losses</p><p className="text-graphite-900 mt-1">{referral.financialLosses}</p></div>
                <div><p className="text-xs text-graphite-500">Witnesses</p><p className="text-graphite-900 mt-1">{referral.witnesses}</p></div>
                <div><p className="text-xs text-graphite-500">Potential deadline concerns</p><p className="text-graphite-900 mt-1">{referral.potentialDeadlineConcerns}</p></div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Claim assessment <span className="text-xs font-normal text-graphite-500">(preliminary intake analysis, not legal advice)</span></h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                <div><dt className="text-xs text-graphite-500">Information completeness</dt><dd className="text-graphite-900">{referral.assessment.informationCompleteness}%</dd></div>
                <div><dt className="text-xs text-graphite-500">Evidence strength</dt><dd className="text-graphite-900">{referral.assessment.evidenceStrength}%</dd></div>
                <div><dt className="text-xs text-graphite-500">Timeline clarity</dt><dd className="text-graphite-900">{referral.assessment.timelineClarity}%</dd></div>
                <div><dt className="text-xs text-graphite-500">Document availability</dt><dd className="text-graphite-900">{referral.assessment.documentAvailability}%</dd></div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-graphite-500 mb-1">Identified uncertainties</p>
                <ul className="text-sm text-graphite-900 list-disc list-inside space-y-1">{referral.assessment.identifiedUncertainties.map((u) => <li key={u}>{u}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs text-graphite-500 mb-1">Suggested questions for consultation</p>
                <ul className="text-sm text-graphite-900 list-disc list-inside space-y-1">{referral.assessment.suggestedConsultationQuestions.map((q) => <li key={q}>{q}</li>)}</ul>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Missing information</h2>
              {referral.missingInformation.length === 0 ? <p className="text-sm text-graphite-500">No critical gaps identified.</p> : (
                <ul className="text-sm text-graphite-900 list-disc list-inside space-y-1">{referral.missingInformation.map((m) => <li key={m}>{m}</li>)}</ul>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Documents ({referral.documents.length})</h2>
              <ul className="space-y-2">
                {referral.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm border border-graphite-100 rounded-lg p-3">
                    <div>
                      <p className="text-graphite-900 font-medium">{d.name}</p>
                      <p className="text-xs text-graphite-500">{d.description}</p>
                    </div>
                    <Badge tone="gray">{d.category}</Badge>
                  </li>
                ))}
                {referral.documents.length === 0 && <p className="text-sm text-graphite-500">No documents provided yet.</p>}
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Timeline</h2>
              <ol className="space-y-3">
                {referral.timeline.map((e) => (
                  <li key={e.id} className="text-sm border-l-2 border-teal-400 pl-3">
                    <p className="font-medium text-graphite-900">{e.date} — {e.title}</p>
                    <p className="text-graphite-500">{e.description}</p>
                  </li>
                ))}
                {referral.timeline.length === 0 && <p className="text-sm text-graphite-500">No timeline events provided yet.</p>}
              </ol>
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 mb-3">Internal notes</h2>
              <div className="flex gap-2 mb-4">
                <input value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Add an internal note..." className="flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
                <Button size="sm" onClick={() => { if (noteBody.trim()) { addReferralNote(referral!.id, noteBody.trim()); setNoteBody(""); } }}>Add note</Button>
              </div>
              <ul className="space-y-3">
                {referral.notes.map((n) => (
                  <li key={n.id} className="text-sm border-b border-graphite-100 pb-2">
                    <p className="text-graphite-900">{n.body}</p>
                    <p className="text-xs text-graphite-400 mt-1">{n.authorName} · {new Date(n.createdAt).toLocaleString()}</p>
                  </li>
                ))}
                {referral.notes.length === 0 && <p className="text-sm text-graphite-500">No internal notes yet.</p>}
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Internal lawyer controls</h2>
              <div className="grid grid-cols-1 gap-2">
                <Button size="sm" disabled={referral.status === "converted"} onClick={() => updateReferralStatus(referral!.id, "accepted")}>Accept Referral</Button>
                <Button size="sm" variant="danger" disabled={referral.status === "converted"} onClick={() => setShowDecline(true)}>Decline Referral</Button>
                <Button size="sm" variant="outline" onClick={() => updateReferralStatus(referral!.id, "more_info_requested")}>Request More Information</Button>
                <Button size="sm" variant="outline" onClick={() => runConflictCheck(referral!.id)}>Run Conflict Check</Button>
                <Button size="sm" variant="outline" onClick={() => setShowConsultForm((v) => !v)}>Schedule Consultation</Button>
                <Button size="sm" variant="outline" onClick={() => updateReferralStatus(referral!.id, "under_review")}>Share with Team</Button>
                <Button size="sm" variant="secondary" disabled={referral.status === "converted"} onClick={() => setShowConvert(true)}>Convert to Matter</Button>
                {referral.convertedMatterId && (
                  <Link href={`/matters/${referral.convertedMatterId}`}><Button size="sm" variant="ghost" className="w-full">View converted matter →</Button></Link>
                )}
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium text-graphite-900 mb-1">Assign lawyer</p>
                <select value={referral.assignedLawyerId ?? ""} onChange={(e) => assignLawyer(referral!.id, e.target.value)} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                  <option value="">Unassigned</option>
                  {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </div>

              {showDecline && (
                <div className="mt-4 border border-red-200 rounded-lg p-3 space-y-2 bg-red-50">
                  <p className="text-xs font-medium text-red-900">Decline reason (required)</p>
                  <select value={declineReason} onChange={(e) => setDeclineReason(e.target.value as DeclineReason)} className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus-ring">
                    {DECLINE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <textarea value={declineDetail} onChange={(e) => setDeclineDetail(e.target.value)} placeholder="Additional detail (optional)" rows={2} className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus-ring" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={handleDeclineSubmit}>Confirm decline</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowDecline(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {showConsultForm && (
                <div className="mt-4 border border-graphite-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-graphite-900">Schedule consultation</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={consultDate} onChange={(e) => setConsultDate(e.target.value)} className="rounded-lg border border-graphite-200 px-2 py-1.5 text-xs focus-ring" />
                    <input type="time" value={consultTime} onChange={(e) => setConsultTime(e.target.value)} className="rounded-lg border border-graphite-200 px-2 py-1.5 text-xs focus-ring" />
                  </div>
                  <select value={consultLawyer} onChange={(e) => setConsultLawyer(e.target.value)} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-xs focus-ring">
                    {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                  </select>
                  <select value={consultType} onChange={(e) => setConsultType(e.target.value as ConsultationMeetingType)} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-xs focus-ring">
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="in_person">In person</option>
                  </select>
                  <textarea value={consultPrep} onChange={(e) => setConsultPrep(e.target.value)} rows={2} className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-xs focus-ring" placeholder="Preparation instructions" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleScheduleSubmit}>Send confirmation</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowConsultForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {referral.consultation && (
                <div className="mt-4 border border-teal-200 rounded-lg p-3 bg-teal-50 space-y-2">
                  <p className="text-xs font-medium text-teal-900">Consultation ({referral.consultation.status})</p>
                  <p className="text-xs text-teal-900">{referral.consultation.meetingType} · {referral.consultation.confirmedTime ? new Date(referral.consultation.confirmedTime).toLocaleString() : "Time TBD"}</p>
                  {referral.consultation.status === "confirmed" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(["retained", "follow_up_required", "declined_by_firm", "declined_by_consumer", "referred_elsewhere", "pending_documents"] as const).map((o) => (
                        <button key={o} onClick={() => recordConsultationOutcome(referral!.id, o, "")} className="text-[11px] px-2 py-1 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-100">
                          {o.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  )}
                  {referral.consultation.outcome && <p className="text-xs text-teal-900">Outcome: {referral.consultation.outcome.replace(/_/g, " ")}</p>}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-graphite-900 text-sm mb-3">Conflict check</h2>
              <ConflictStatusBadge status={referral.conflictCheck.status} />
              <p className="text-[11px] text-graphite-400 mt-2">
                Simulated for this demo. Does not replace the firm's formal conflict-check procedure.
              </p>
              <ul className="mt-3 space-y-2">
                {referral.conflictCheck.entities.map((e) => (
                  <li key={e.name} className="flex items-center justify-between text-xs">
                    <span className="text-graphite-700">{e.name} <span className="text-graphite-400">({e.role.replace(/_/g, " ")})</span></span>
                    <ConflictStatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
              {referral.conflictCheck.runAt && <p className="text-[11px] text-graphite-400 mt-2">Last run {new Date(referral.conflictCheck.runAt).toLocaleString()} by {referral.conflictCheck.runBy}</p>}
            </Card>

            <AIAssistantPanel context="this referral" />
          </div>
        </div>

        {showConvert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="font-semibold text-graphite-900 mb-1">Convert referral to matter</h2>
              <p className="text-xs text-graphite-500 mb-4">Source referral {referral.id} will be preserved on the new matter for auditability.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-graphite-900">Matter name</label>
                  <input value={matterName} onChange={(e) => setMatterName(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-graphite-900">Responsible lawyer</label>
                  <select value={responsibleLawyer} onChange={(e) => setResponsibleLawyer(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                    {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-graphite-900">Supporting team</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {team.filter((t) => t.role === "paralegal" || t.role === "legal_assistant" || t.role === "intake_coordinator").map((t) => (
                      <button
                        key={t.id} type="button"
                        onClick={() => setSupportingTeam((prev) => (prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]))}
                        className={`text-xs px-2.5 py-1 rounded-full border ${supportingTeam.includes(t.id) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-graphite-200 text-graphite-600"}`}
                      >
                        {t.fullName}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-graphite-900">Initial matter stage</label>
                  <input value={matterStage} onChange={(e) => setMatterStage(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
                </div>
                <InfoBanner tone="teal">
                  This will create a matter number, confirm client information, import referral documents, timeline, and
                  notes, create a client portal invitation, and set retainer/consent status to pending — all editable
                  afterward from the matter workspace.
                </InfoBanner>
              </div>
              <div className="flex gap-2 mt-5">
                <Button onClick={handleConvertSubmit}>Create matter</Button>
                <Button variant="ghost" onClick={() => setShowConvert(false)}>Cancel</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
