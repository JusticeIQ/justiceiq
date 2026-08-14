"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button, InfoBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }
    router.push("/dashboard");
  }

  function handleDemo() {
    loginDemo();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite-950 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="h-9 w-9 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">IQ</span>
          <span className="font-semibold text-xl text-white">SolonIQ<span className="text-teal-400">™</span></span>
        </div>
        <Card>
          <h1 className="text-xl font-bold text-graphite-900">Sign in to your firm</h1>
          <p className="text-sm text-graphite-500 mt-1">Access referrals, matters, and firm analytics.</p>

          <Button variant="secondary" className="w-full mt-6" type="button" onClick={handleDemo}>
            Continue with demo law firm
          </Button>
          <p className="text-xs text-graphite-400 text-center mt-2">Instantly loads a seeded firm, team, referral pipeline, and matters.</p>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-graphite-100 flex-1" />
            <span className="text-xs text-graphite-400">or sign in with email</span>
            <div className="h-px bg-graphite-100 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-graphite-900" htmlFor="email">Work email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-graphite-900" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-teal-600 hover:underline">Forgot password?</Link>
              </div>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          <InfoBanner tone="gray" >
            Your session is encrypted in transit and protected by role-based access controls. Single sign-on (SSO) support
            is planned for a future release.
          </InfoBanner>

          <p className="text-sm text-graphite-500 mt-4 text-center">
            New firm?{" "}
            <Link href="/signup" className="text-teal-600 font-medium hover:underline">Create a law-firm account</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
