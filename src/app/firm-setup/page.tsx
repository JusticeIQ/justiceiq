"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, InfoBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";

const ROLES = ["Firm Administrator", "Partner", "Lawyer", "Paralegal", "Intake Coordinator", "Legal Assistant", "Read-Only Analyst"];

export default function FirmSetupPage() {
  const router = useRouter();
  const { firm, team } = useAppState();

  const [practiceAreas, setPracticeAreas] = useState<string[]>(["Personal Injury", "Employment Law"]);
  const [jurisdictions, setJurisdictions] = useState(firm?.jurisdictions.join(", ") ?? "California");
  const [officeLocations, setOfficeLocations] = useState(firm?.offices.map((o) => o.address).join("; ") ?? "");
  const [firmSize, setFirmSize] = useState(firm?.firmSize ?? "11-25 attorneys and staff");
  const [languages, setLanguages] = useState(firm?.languages.join(", ") ?? "English");
  const [minCriteria, setMinCriteria] = useState(firm?.minimumCaseCriteria ?? "");
  const [conflictProcedure, setConflictProcedure] = useState(firm?.conflictScreeningProcedure ?? "");
  const [availability, setAvailability] = useState(firm?.consultationAvailability ?? "");
  const [tier, setTier] = useState(firm?.subscriptionTier ?? "gold");
  const [step, setStep] = useState(1);

  function togglePracticeArea(area: string) {
    setPracticeAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  return (
    <div className="min-h-screen bg-graphite-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="h-9 w-9 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">IQ</span>
          <span className="font-semibold text-xl text-white">JusticeIQ<span className="text-teal-400">™</span></span>
        </div>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-graphite-900">Firm setup</h1>
            <span className="text-xs text-graphite-500">Step {step} of 3</span>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-graphite-900">Firm profile</h2>
              <div>
                <label className="text-xs font-medium text-graphite-900">Practice areas</label>
                <div className="flex gap-2 mt-1">
                  {["Personal Injury", "Employment Law"].map((area) => (
                    <button key={area} type="button" onClick={() => togglePracticeArea(area)} className={`text-xs px-3 py-1.5 rounded-full border focus-ring ${practiceAreas.includes(area) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-graphite-200 text-graphite-600"}`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Jurisdictions</label>
                <input value={jurisdictions} onChange={(e) => setJurisdictions(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Office locations</label>
                <input value={officeLocations} onChange={(e) => setOfficeLocations(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-graphite-900">Firm size</label>
                  <input value={firmSize} onChange={(e) => setFirmSize(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-graphite-900">Languages spoken</label>
                  <input value={languages} onChange={(e) => setLanguages(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-graphite-900">Team & referral preferences</h2>
              <div>
                <label className="text-xs font-medium text-graphite-900">Primary administrator</label>
                <p className="text-sm text-graphite-700 mt-1">{team[0]?.fullName ?? "You"} (Firm Administrator)</p>
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Lawyers on the platform</label>
                <ul className="mt-1 text-sm text-graphite-700 list-disc list-inside">
                  {team.filter((t) => t.role === "lawyer" || t.role === "partner").map((t) => <li key={t.id}>{t.fullName} — {t.title}</li>)}
                </ul>
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Available roles for team invitations</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ROLES.map((r) => <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-graphite-100 text-graphite-600">{r}</span>)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Minimum case criteria</label>
                <textarea rows={2} value={minCriteria} onChange={(e) => setMinCriteria(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Conflict-screening procedure</label>
                <textarea rows={2} value={conflictProcedure} onChange={(e) => setConflictProcedure(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Consultation availability</label>
                <input value={availability} onChange={(e) => setAvailability(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-graphite-900">Notifications & subscription</h2>
              <div>
                <label className="text-xs font-medium text-graphite-900">Notification preferences</label>
                <ul className="mt-1 text-sm text-graphite-700 list-disc list-inside">
                  <li>New referral email + in-app alert</li>
                  <li>Deadline reminders 7 / 3 / 1 days out</li>
                  <li>Daily digest of client messages</li>
                </ul>
              </div>
              <div>
                <label className="text-xs font-medium text-graphite-900">Subscription tier</label>
                <select value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring">
                  <option value="basic">Basic</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
              <InfoBanner tone="teal">
                You can change any of these settings later from Settings → Firm Profile, Referral Criteria, and Subscription.
              </InfoBanner>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-graphite-100">
            <Button variant="outline" size="sm" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 3 ? (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button size="sm" onClick={() => router.push("/dashboard")}>Finish setup</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
