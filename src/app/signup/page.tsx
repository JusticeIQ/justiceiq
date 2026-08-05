"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginDemo } = useAppState();
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    const result = signup(firmName, email, password, confirmPassword);
    if (!result.ok) {
      setError(result.error ?? "Unable to create account.");
      return;
    }
    router.push("/firm-setup");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite-950 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="h-9 w-9 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">IQ</span>
          <span className="font-semibold text-xl text-white">JusticeIQ<span className="text-teal-400">™</span></span>
        </div>
        <Card>
          <h1 className="text-xl font-bold text-graphite-900">Create your law-firm account</h1>
          <p className="text-sm text-graphite-500 mt-1">Start receiving and managing qualified referrals.</p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium text-graphite-900" htmlFor="firmName">Firm name</label>
              <input id="firmName" required value={firmName} onChange={(e) => setFirmName(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-graphite-900" htmlFor="email">Work email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-graphite-900" htmlFor="password">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-graphite-900" htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            </div>
            <label className="flex items-start gap-2 text-xs text-graphite-500">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5" />
              I acknowledge the <Link href="/help" className="text-teal-600 hover:underline">Terms of Service and Privacy Policy</Link>.
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Create account and continue</Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-graphite-100 flex-1" />
            <span className="text-xs text-graphite-400">or</span>
            <div className="h-px bg-graphite-100 flex-1" />
          </div>
          <Button variant="outline" className="w-full" type="button" onClick={() => { loginDemo(); router.push("/dashboard"); }}>
            Continue with demo law firm
          </Button>

          <p className="text-sm text-graphite-500 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
