"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function ClientsPage() {
  const { clients, matters, communications, team } = useAppState();
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => c.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Clients" }]} />
        <h1 className="text-2xl font-bold text-graphite-900">Clients</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients by name..." className="w-full max-w-md rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring" />

        {filtered.length === 0 ? (
          <EmptyState title="No clients found" description="Convert a referral to a matter to create your first client." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((c) => {
              const activeMatters = matters.filter((m) => m.clientId === c.id && m.status === "active");
              const closedMatters = matters.filter((m) => m.clientId === c.id && m.status === "closed");
              const clientComms = communications.filter((comm) => comm.clientId === c.id);
              const docCount = matters.filter((m) => m.clientId === c.id).reduce((sum, m) => sum + m.documents.length, 0);
              return (
                <Card key={c.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-graphite-900">{c.fullName}</p>
                      <p className="text-xs text-graphite-500">{c.email}</p>
                    </div>
                    <Badge tone={c.portalStatus === "active" ? "teal" : c.portalStatus === "invited" ? "amber" : "gray"}>{c.portalStatus.replace(/_/g, " ")}</Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div><dt className="text-graphite-500">Active matters</dt><dd className="text-graphite-900">{activeMatters.length}</dd></div>
                    <div><dt className="text-graphite-500">Closed matters</dt><dd className="text-graphite-900">{closedMatters.length}</dd></div>
                    <div><dt className="text-graphite-500">Documents</dt><dd className="text-graphite-900">{docCount}</dd></div>
                    <div><dt className="text-graphite-500">Communications</dt><dd className="text-graphite-900">{clientComms.length}</dd></div>
                    <div><dt className="text-graphite-500">Relationship owner</dt><dd className="text-graphite-900">{team.find((t) => t.id === c.relationshipOwnerId)?.fullName}</dd></div>
                  </dl>
                  <div className="mt-3 space-y-1">
                    {activeMatters.map((m) => <Link key={m.id} href={`/matters/${m.id}`} className="block text-xs text-teal-700 hover:underline">{m.matterName}</Link>)}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
