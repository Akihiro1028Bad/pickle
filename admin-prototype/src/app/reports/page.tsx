"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card, StatusBadge, SeverityBadge, Badge } from "@/components/ui";

const TYPE_LABEL: Record<string, string> = { post: "投稿", dm: "DM", user: "ユーザー", profile: "プロフィール" };

export default function ReportsPage() {
  const { reports } = useAdmin();
  const open = reports.filter((r) => r.status === "open" || r.status === "in_progress");
  const overdue = open.filter((r) => r.ageHours >= 24);
  const high = open.filter((r) => r.severity === "high");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "overdue" | "high">("all");
  const rows = reports
    .filter((r) => {
      if (filter === "overdue") return r.ageHours >= 24 && (r.status === "open" || r.status === "in_progress");
      if (filter === "high") return r.severity === "high" && (r.status === "open" || r.status === "in_progress");
      if (filter === "open" || filter === "in_progress") return r.status === filter;
      return true;
    })
    .sort((a, b) => {
      const score = (r: typeof reports[number]) =>
        (r.status === "resolved" || r.status === "rejected" ? -100 : 0) +
        (r.ageHours >= 24 ? 100 : 0) +
        (r.severity === "high" ? 40 : r.severity === "medium" ? 20 : 0) +
        (r.status === "open" ? 10 : 0) +
        r.ageHours;
      return score(b) - score(a);
    });
  const filters = [
    { key: "all" as const, label: "すべて", count: reports.length },
    { key: "open" as const, label: "未着手", count: reports.filter((r) => r.status === "open").length },
    { key: "in_progress" as const, label: "対応中", count: reports.filter((r) => r.status === "in_progress").length },
    { key: "overdue" as const, label: "SLA超過", count: overdue.length },
    { key: "high" as const, label: "高重大度", count: high.length },
  ];

  return (
    <div>
      <PageHeader
        title="通報 / Trust & Safety"
        desc="App Store 1.2 要件：24時間以内の対応を目安に。"
        action={<Badge tone={open.length ? "danger" : "ok"}>{open.length} 件 未対応</Badge>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary label="未対応" value={open.length} tone={open.length ? "text-ember" : "text-[#4ade80]"} />
        <Summary label="SLA超過" value={overdue.length} tone={overdue.length ? "text-ember" : "text-muted"} />
        <Summary label="高重大度" value={high.length} tone={high.length ? "text-ember" : "text-muted"} />
        <Summary label="24h以内対応" value={`${Math.max(0, 24 - Math.max(...open.map((r) => r.ageHours), 0))}h`} tone="text-accent" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-2 font-ja text-[12px] font-bold ${
              filter === f.key ? "bg-accent text-on-accent" : "bg-surface text-ink-2 hover:text-ink"
            }`}
          >
            {f.label} <span className="opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      {/* PC: テーブル */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/8 font-ja text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-semibold">対象</th>
              <th className="px-4 py-3 font-semibold">種別</th>
              <th className="px-4 py-3 font-semibold">理由</th>
              <th className="px-4 py-3 font-semibold">通報者</th>
              <th className="px-4 py-3 font-semibold">重大度</th>
              <th className="px-4 py-3 font-semibold">状態</th>
              <th className="px-4 py-3 font-semibold">SLA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const over = r.ageHours >= 24;
              return (
                <tr key={r.id} className={`border-b border-white/5 last:border-0 hover:bg-white/[0.03] ${over ? "bg-ember/[0.04]" : ""}`}>
                  <td className="max-w-[280px] px-4 py-3">
                    <Link href={`/reports/${r.id}`} className="block truncate font-ja text-[13px] font-bold text-ink hover:text-accent">
                      {r.targetSummary}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge tone="neutral">{TYPE_LABEL[r.targetType]}</Badge></td>
                  <td className="px-4 py-3 font-ja text-[12px] text-ink-2">{r.reason}</td>
                  <td className="px-4 py-3 font-ja text-[12px] text-muted">{r.reporter}</td>
                  <td className="px-4 py-3"><SeverityBadge level={r.severity} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} openLabel="未着手" /></td>
                  <td className="px-4 py-3">
                    {r.status === "resolved" || r.status === "rejected" ? (
                      <span className="font-ja text-[11px] text-faint">—</span>
                    ) : (
                      <span className={`font-ja text-[11px] font-bold ${over ? "text-ember" : "text-muted"}`}>
                        {over ? `${r.ageHours - 24}h 超過` : `残り ${24 - r.ageHours}h`}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* モバイル: カード */}
      <div className="flex flex-col gap-3 lg:hidden">
        {rows.map((r) => {
          const over = r.ageHours >= 24;
          const done = r.status === "resolved" || r.status === "rejected";
          return (
            <Link key={r.id} href={`/reports/${r.id}`} className="block">
              <Card className={`p-4 transition hover:border-accent/40 ${over && !done ? "border-ember/30" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 font-ja text-[13px] font-bold text-ink line-clamp-2">{r.targetSummary}</span>
                  <Badge tone="neutral">{TYPE_LABEL[r.targetType]}</Badge>
                </div>
                <p className="mt-1 font-ja text-[12px] text-ink-2">{r.reason}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <SeverityBadge level={r.severity} />
                  <StatusBadge status={r.status} openLabel="未着手" />
                  <span className="font-ja text-[11px] text-muted">通報者 {r.reporter}</span>
                </div>
                {!done && (
                  <div className={`mt-2 font-ja text-[11px] font-bold ${over ? "text-ember" : "text-muted"}`}>
                    {over ? `SLA ${r.ageHours - 24}h 超過` : `SLA 残り ${24 - r.ageHours}h`}
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <Card className="p-8 text-center font-ja text-[13px] text-muted">該当する通報がありません</Card>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <Card className="p-4">
      <div className="font-ja text-[11px] font-bold text-muted">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${tone}`}>{value}</div>
    </Card>
  );
}
