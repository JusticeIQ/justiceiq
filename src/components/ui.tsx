"use client";

import React from "react";
import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("bg-white rounded-xl2 shadow-card border border-graphite-100 p-5", className)}>{children}</div>;
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "teal" | "navy" | "amber" | "gray" | "red" | "green" }) {
  const tones: Record<string, string> = {
    teal: "bg-teal-100 text-teal-700",
    navy: "bg-graphite-900 text-white",
    amber: "bg-amber-100 text-amber-800",
    gray: "bg-graphite-100 text-graphite-600",
    red: "bg-red-100 text-red-700",
    green: "bg-emerald-100 text-emerald-700",
  };
  return <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "outline" | "danger"; size?: "sm" | "md" | "lg" }) {
  const variants: Record<string, string> = {
    primary: "bg-graphite-900 text-white hover:bg-graphite-800",
    secondary: "bg-teal-500 text-white hover:bg-teal-600",
    outline: "bg-white text-graphite-900 border border-graphite-200 hover:bg-graphite-50",
    ghost: "bg-transparent text-graphite-700 hover:bg-graphite-100",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
  };
  const sizes: Record<string, string> = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };
  return (
    <button className={clsx("rounded-lg font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ProgressBar({ value, tone = "teal" }: { value: number; tone?: "teal" | "amber" | "red" }) {
  const colors: Record<string, string> = { teal: "bg-teal-500", amber: "bg-amber-500", red: "bg-red-500" };
  return (
    <div className="h-1.5 w-full bg-graphite-100 rounded-full overflow-hidden">
      <div className={clsx("h-full rounded-full", colors[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-graphite-200 rounded-xl2 bg-white/60">
      <h3 className="font-semibold text-graphite-900">{title}</h3>
      <p className="text-sm text-graphite-500 mt-1 max-w-md mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-graphite-500 py-8 justify-center" role="status" aria-live="polite">
      <span className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      {label}...
    </div>
  );
}

export function InfoBanner({ tone = "amber", children }: { tone?: "amber" | "teal" | "gray"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    teal: "border-teal-300 bg-teal-50 text-teal-900",
    gray: "border-graphite-200 bg-graphite-50 text-graphite-700",
  };
  return (
    <div className={clsx("rounded-lg border p-3 text-xs flex gap-2", tones[tone])}>
      <span aria-hidden>ⓘ</span>
      <div>{children}</div>
    </div>
  );
}

export function StatCard({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: "up" | "down" | "neutral" }) {
  return (
    <Card>
      <p className="text-xs text-graphite-500">{label}</p>
      <p className="text-2xl font-bold text-graphite-900 mt-1">{value}</p>
      {sub && <p className={clsx("text-xs mt-1", tone === "up" ? "text-emerald-600" : tone === "down" ? "text-red-600" : "text-graphite-500")}>{sub}</p>}
    </Card>
  );
}

export function MiniBarChart({ data, max }: { data: { label: string; value: number }[]; max?: number }) {
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-graphite-100 rounded-t-md flex items-end" style={{ height: "100%" }}>
            <div className="w-full bg-teal-500 rounded-t-md" style={{ height: `${(d.value / m) * 100}%` }} />
          </div>
          <span className="text-[10px] text-graphite-500 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniLineChart({ points, width = 320, height = 100 }: { points: number[]; width?: number; height?: number }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = width / (points.length - 1 || 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - ((p - min) / range) * height}`).join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#0fb8ac" strokeWidth={2.5} />
    </svg>
  );
}
