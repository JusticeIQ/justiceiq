"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs, BackButton } from "@/components/Breadcrumbs";
import { MatterWorkspace } from "@/components/MatterWorkspace";
import { useAppState } from "@/lib/store";

export default function MatterBillingPage() {
  const params = useParams<{ matterId: string }>();
  const { getMatter } = useAppState();
  const matter = getMatter(params.matterId);

  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Current Cases", href: "/matters" }, { label: matter?.matterName ?? params.matterId }]} />
      <BackButton href="/matters" label="Back to Current Cases" />
      <MatterWorkspace matterId={params.matterId} activeTab="billing" />
    </AppShell>
  );
}
