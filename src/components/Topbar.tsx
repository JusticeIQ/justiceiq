"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { Button } from "./ui";

const QUICK_CREATE_ITEMS = [
  { label: "New matter", href: "/matters" },
  { label: "New contact", href: "/contacts" },
  { label: "New task", href: "/tasks" },
  { label: "New calendar event", href: "/calendar" },
  { label: "New note", href: "/matters" },
  { label: "Upload document", href: "/matters" },
];

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const router = useRouter();
  const { notifications, markNotificationRead, currentUser, logout } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-graphite-100 h-16 flex items-center px-4 md:px-6 gap-3">
      <button className="lg:hidden text-graphite-700 focus-ring rounded p-1" onClick={onOpenMobileNav} aria-label="Open navigation">
        ☰
      </button>

      <div className="flex-1 max-w-md">
        <input
          type="search"
          placeholder="Search referrals, matters, clients, contacts..."
          className="w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm focus-ring bg-graphite-50"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto relative">
        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => { setShowQuickCreate((v) => !v); setShowNotifications(false); setShowProfile(false); }}>
            + Quick create
          </Button>
          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-graphite-100 py-1 z-40">
              {QUICK_CREATE_ITEMS.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setShowQuickCreate(false)} className="block px-4 py-2 text-sm text-graphite-700 hover:bg-graphite-50">
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="relative h-9 w-9 rounded-full hover:bg-graphite-100 flex items-center justify-center focus-ring"
            onClick={() => { setShowNotifications((v) => !v); setShowQuickCreate(false); setShowProfile(false); }}
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-graphite-100 py-2 z-40 max-h-96 overflow-y-auto">
              <p className="px-4 pb-2 text-xs font-semibold text-graphite-500 uppercase tracking-wide">Notifications</p>
              {notifications.length === 0 && <p className="px-4 py-3 text-sm text-graphite-500">No notifications.</p>}
              {notifications.map((n) => (
                <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-graphite-50 ${n.read ? "text-graphite-500" : "text-graphite-900 font-medium"}`}>
                  {n.message}
                  <span className="block text-[11px] text-graphite-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="h-9 w-9 rounded-full bg-graphite-900 text-white flex items-center justify-center text-xs font-semibold focus-ring"
            onClick={() => { setShowProfile((v) => !v); setShowQuickCreate(false); setShowNotifications(false); }}
          >
            {currentUser?.avatarInitials ?? "U"}
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-graphite-100 py-1 z-40">
              <div className="px-4 py-2 border-b border-graphite-100">
                <p className="text-sm font-medium text-graphite-900">{currentUser?.fullName}</p>
                <p className="text-xs text-graphite-500">{currentUser?.title}</p>
              </div>
              <Link href="/settings" className="block px-4 py-2 text-sm text-graphite-700 hover:bg-graphite-50">Settings</Link>
              <Link href="/subscription" className="block px-4 py-2 text-sm text-graphite-700 hover:bg-graphite-50">Subscription</Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => { logout(); router.push("/"); }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
