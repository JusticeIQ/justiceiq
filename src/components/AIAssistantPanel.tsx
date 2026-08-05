"use client";

import { useState } from "react";
import { Card, Badge } from "./ui";

const SUGGESTIONS = [
  "Summarize this intake",
  "What documents are missing?",
  "Draft consultation questions",
  "Organize the chronology",
  "Identify inconsistencies",
  "Suggest a task list",
];

const RESPONSES: Record<string, string> = {
  "Summarize this intake": "Draft summary: Consumer reports a documented incident with a chronology, some supporting evidence, and a stated goal. Key dates and parties are captured. Recommend lawyer review before relying on this summary in any filing.",
  "What documents are missing?": "Based on the intake, consider requesting: any incident/police report not yet on file, complete medical or employment records, and confirmation of insurance or employer correspondence.",
  "Draft consultation questions": "Suggested questions: What outcome is the client hoping for? Are there any deadlines already communicated to them? What documentation do they still need to locate?",
  "Organize the chronology": "Suggested chronological structure: (1) date of underlying event, (2) any complaint or report made, (3) employer/insurer response, (4) treatment or remediation steps, (5) current status.",
  "Identify inconsistencies": "No clear factual inconsistencies detected in the structured fields provided. Recommend a lawyer manually cross-check dates against uploaded documents before relying on this.",
  "Suggest a task list": "Suggested tasks: confirm jurisdiction and deadlines, request missing documents, run a conflict check, and schedule an initial consultation.",
};

export function AIAssistantPanel({ context }: { context?: string }) {
  const [messages, setMessages] = useState<{ from: "assistant" | "user"; text: string }[]>([
    { from: "assistant", text: `AI Assistant ready to help review ${context ?? "this record"}. All output is a draft suggestion for lawyer review — not a final legal determination.` },
  ]);
  const [open, setOpen] = useState(true);

  function ask(suggestion: string) {
    setMessages((m) => [...m, { from: "user", text: suggestion }, { from: "assistant", text: RESPONSES[suggestion] ?? "This is a drafting aid only — please review and confirm before use." }]);
  }

  return (
    <Card className="border-teal-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold" aria-hidden>AI</span>
          <div>
            <p className="font-semibold text-graphite-900 text-sm">JusticeIQ AI Assistant</p>
            <Badge tone="amber">Draft only — requires review</Badge>
          </div>
        </div>
        <button className="text-xs text-graphite-500 hover:text-teal-600 focus-ring rounded" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "assistant" ? "text-sm bg-teal-50 text-graphite-900 rounded-lg p-3" : "text-sm bg-graphite-100 text-graphite-900 rounded-lg p-3 ml-6"}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="text-xs px-3 py-1.5 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 focus-ring">
                {s}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-graphite-400">
            The assistant does not make final legal decisions, replace lawyer judgment, guarantee outcomes, fabricate
            citations, invent facts, or send external communications automatically. All content is labeled as a draft and
            requires lawyer review before use.
          </p>
        </div>
      )}
    </Card>
  );
}
