"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/referrals", label: "New Referrals", icon: "📥" },
  { href: "/matters", label: "Current Cases", icon: "📁" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/clients", label: "Clients", icon: "🧑‍💼" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/reports", label: "Reports", icon: "📄" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/team", label: "Team", icon: "🧩" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/help", label: "Help", icon: "❓" },
];

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { firm } = useAppState();

  return (
    <div className={mobile ? "flex flex-col h-full" : "hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 h-screen sticky top-0 bg-graphite-950 text-white"}>
      <div className={mobile ? "flex flex-col h-full bg-graphite-950 text-white" : "flex flex-col h-full"}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10 shrink-0">
          <span className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">IQ</span>
          <span className="font-semibold text-lg tracking-tight">
            SolonIQ<span className="text-teal-400">™</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium focus-ring transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 text-xs text-white/50 shrink-0">
          <p className="text-white/80 font-medium truncate">{firm?.name ?? "SolonIQ"}</p>
          <p className="mt-0.5">Firm switching coming soon</p>
        </div>
      </div>
    </div>
  );
}
