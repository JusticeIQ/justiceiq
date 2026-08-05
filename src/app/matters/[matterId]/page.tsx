"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs, BackButton } from "@/components/Breadcrumbs";
import { MatterWorkspace, MatterTab } from "@/components/MatterWorkspace";
import { Spinner } from "@/components/ui";
import { useAppState } from "@/lib/store";

function MatterBaseContent() {
  const params = useParams<{ matterId: string }>();
  const searchParams = useSearchParams();
  const { getMatter } = useAppState();
  const matter = getMatter(params.matterId);
  const tab = (searchParams.get("tab") as MatterTab) || "overview";

  return (
    <div>
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Current Cases", href: "/matters" }, { label: matter?.matterName ?? params.matterId }]} />
      <BackButton href="/matters" label="Back to Current Cases" />
      <MatterWorkspace matterId={params.matterId} activeTab={tab} />
    </div>
  );
}

export default function MatterBasePage() {
  return (
    <AppShell>
      <Suspense fallback={<Spinner />}>
        <MatterBaseContent />
      </Suspense>
    </AppShell>
  );
}
