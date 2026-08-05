"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function ContactsPage() {
  const { contacts, matters } = useAppState();
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) => `${c.name} ${c.organization} ${c.role}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Contacts" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Contacts</h1>

        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts by name, organization, or role..." className="w-full max-w-md rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />

        {filtered.length === 0 ? (
          <EmptyState title="No contacts found" description="Try a different search term." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-graphite-900">{c.name}</p>
                    <p className="text-xs text-graphite-500">{c.organization}</p>
                  </div>
                  <Badge tone="gray">{c.role}</Badge>
                </div>
                <dl className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div><dt className="text-graphite-500">Email</dt><dd className="text-graphite-900">{c.email}</dd></div>
                  <div><dt className="text-graphite-500">Phone</dt><dd className="text-graphite-900">{c.phone}</dd></div>
                  <div><dt className="text-graphite-500">Jurisdiction</dt><dd className="text-graphite-900">{c.jurisdiction}</dd></div>
                  <div><dt className="text-graphite-500">Prefers</dt><dd className="text-graphite-900">{c.communicationPreference}</dd></div>
                </dl>
                {c.relatedMatterIds.length > 0 && (
                  <p className="text-xs text-graphite-500 mt-2">
                    Related matters: {c.relatedMatterIds.map((id) => matters.find((m) => m.id === id)?.matterName).filter(Boolean).join(", ")}
                  </p>
                )}
                {c.notes && <p className="text-xs text-graphite-500 mt-2 italic">{c.notes}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
