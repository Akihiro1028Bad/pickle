"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card, StatusBadge, PbtBadgeChips } from "@/components/ui";
import type { MemberStatus } from "@/lib/mock";

const FILTERS: { key: MemberStatus | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "member", label: "会員" },
  { key: "guest", label: "ゲスト" },
  { key: "suspended", label: "一時停止" },
  { key: "banned", label: "BAN" },
];

export default function MembersPage() {
  const { members } = useAdmin();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<MemberStatus | "all">("all");

  const rows = members.filter((m) => {
    const matchQ = !q || `${m.name}${m.handle}${m.email}`.toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "all" || m.status === filter;
    return matchQ && matchF;
  });

  return (
    <div>
      <PageHeader title="会員管理" desc={`${members.length} 名`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="名前 / ハンドル / メールで検索"
          className="h-9 w-full rounded-lg border border-white/10 bg-surface px-3 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50 sm:w-64"
        />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 font-ja text-[12px] font-semibold ${
                filter === f.key ? "bg-accent text-on-accent" : "bg-surface text-ink-2 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PC: テーブル */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/8 font-ja text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-semibold">会員</th>
              <th className="px-4 py-3 font-semibold">ステータス</th>
              <th className="px-4 py-3 font-semibold">レベル / DUPR</th>
              <th className="px-4 py-3 font-semibold">登録日</th>
              <th className="px-4 py-3 font-semibold">最終</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/members/${m.id}`} className="block">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-ja text-[13px] font-bold text-ink">{m.name}</span>
                      <PbtBadgeChips badges={m.pbtBadges} />
                      {m.warnings && m.warnings.length > 0 && (
                        <span className="rounded bg-[#fbbf24]/15 px-1.5 py-0.5 font-ja text-[10px] font-bold text-[#fbbf24]">
                          ⚠ {m.warnings.length}
                        </span>
                      )}
                    </div>
                    <div className="font-ja text-[11px] text-muted">{m.handle} · {m.email}</div>
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-4 py-3 font-ja text-[12px] text-ink-2">
                  {m.level}{m.dupr ? ` · DUPR ${m.dupr}` : ""}
                </td>
                <td className="px-4 py-3 font-ja text-[12px] text-muted">{m.joinedAt}</td>
                <td className="px-4 py-3 font-ja text-[12px] text-muted">{m.lastActiveAt}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-ja text-[13px] text-muted">該当する会員がいません</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* モバイル: カード */}
      <div className="flex flex-col gap-3 lg:hidden">
        {rows.map((m) => (
          <Link key={m.id} href={`/members/${m.id}`} className="block">
            <Card className="p-4 transition hover:border-accent/40">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-ja text-[14px] font-bold text-ink">{m.name}</span>
                    <PbtBadgeChips badges={m.pbtBadges} />
                    {m.warnings && m.warnings.length > 0 && (
                      <span className="rounded bg-[#fbbf24]/15 px-1.5 py-0.5 font-ja text-[10px] font-bold text-[#fbbf24]">
                        ⚠ {m.warnings.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-ja text-[11px] text-muted">{m.handle} · {m.email}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="mt-2 flex items-center justify-between font-ja text-[11px] text-muted">
                <span>{m.level}{m.dupr ? ` · DUPR ${m.dupr}` : ""}</span>
                <span>登録 {m.joinedAt} · 最終 {m.lastActiveAt}</span>
              </div>
            </Card>
          </Link>
        ))}
        {rows.length === 0 && (
          <Card className="p-8 text-center font-ja text-[13px] text-muted">該当する会員がいません</Card>
        )}
      </div>
    </div>
  );
}
