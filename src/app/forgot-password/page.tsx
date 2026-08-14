"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite-950 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="h-9 w-9 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">IQ</span>
          <span className="font-semibold text-xl text-white">SolonIQ<span className="text-teal-400">™</span></span>
        </div>
        <Card>
          <h1 className="text-xl font-bold text-graphite-900">Reset your password</h1>
          <p className="text-sm text-graphite-500 mt-1">Enter your work email and we'll send a reset link.</p>

          {sent ? (
            <div className="mt-6 rounded-lg bg-teal-50 border border-teal-200 p-4 text-sm text-teal-800">
              If an account exists for {email || "that address"}, a password reset email has been sent (simulated in this demo).
            </div>
          ) : (
            <form className="space-y-4 mt-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div>
                <label className="text-sm font-medium text-graphite-900" htmlFor="email">Work email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />
              </div>
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          )}

          <p className="text-sm text-graphite-500 mt-6 text-center">
            <Link href="/login" className="text-teal-600 font-medium hover:underline">Back to sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
