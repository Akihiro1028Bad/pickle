"use client";

import Link from "next/link";
import { useAdmin } from "@/lib/store";
import { kpis } from "@/lib/mock";
import { Card, PageHeader, StatusBadge, SeverityBadge } from "@/components/ui";

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="font-ja text-[12px] text-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-1 font-ja text-[11px] text-accent">{sub}</div>}
    </Card>
  );
}

export default function DashboardPage() {
  const { members, posts, reports, inquiries } = useAdmin();
  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_progress");
  const overdueReports = openReports.filter((r) => r.ageHours >= 24);
  const highReports = openReports.filter((r) => r.severity === "high");
  const nextReports = [...openReports].sort((a, b) => {
    const score = (r: typeof reports[number]) => (r.ageHours >= 24 ? 100 : 0) + (r.severity === "high" ? 40 : 0) + r.ageHours;
    return score(b) - score(a);
  });
  const max = Math.max(...kpis.series);

  return (
    <div>
      <PageHeader title="ダッシュボード" desc="サービスの健康状態をひと目で。" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="未対応の通報" value={openReports.length} sub={openReports.length ? "要対応" : "なし"} />
        <Kpi label="SLA超過" value={overdueReports.length} sub={overdueReports.length ? "即時確認" : "なし"} />
        <Kpi label="高重大度" value={highReports.length} />
        <Kpi label="未対応の問い合わせ" value={inquiries.filter((i) => i.status !== "done").length} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-ja text-[13px] font-bold text-ink">DAU 推移（直近7日）</span>
            <span className="font-ja text-[11px] text-muted">単位：人</span>
          </div>
          <div className="flex h-40 items-end gap-3">
            {kpis.series.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-accent-deep to-accent"
                  style={{ height: `${(v / max) * 100}%` }}
                  title={`${v}`}
                />
                <span className="font-ja text-[10px] text-faint">{i + 1}日前</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 font-ja text-[13px] font-bold text-ink">サマリ</div>
          <Row label="総会員数" value={`${members.filter((m) => m.status !== "guest").length} 名`} />
          <Row label="一時停止 / BAN" value={`${members.filter((m) => m.status === "suspended" || m.status === "banned").length} 名`} />
          <Row label="公開中の投稿" value={`${posts.filter((p) => p.status === "open").length} 件`} />
          <Row label="未対応の問い合わせ" value={`${inquiries.filter((i) => i.status !== "done").length} 件`} />
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-ja text-[13px] font-bold text-ink">次に処理すべき通報</span>
          <Link href="/reports" className="font-ja text-[12px] font-bold text-accent">
            すべて見る →
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-white/8">
          {nextReports.slice(0, 5).map((r) => (
            <Link key={r.id} href={`/reports/${r.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
              <SeverityBadge level={r.severity} />
              <span className="min-w-0 flex-1 truncate font-ja text-[13px] text-ink">{r.targetSummary}</span>
              <span className="font-ja text-[12px] text-muted">{r.reason}</span>
              <StatusBadge status={r.status} openLabel="未着手" />
              <span className="w-16 text-right font-ja text-[11px] text-faint">{r.createdAt}</span>
            </Link>
          ))}
          {openReports.length === 0 && <div className="py-3 font-ja text-[13px] text-muted">未対応の通報はありません 🎉</div>}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
      <span className="font-ja text-[12px] text-muted">{label}</span>
      <span className="font-ja text-[13px] font-bold text-ink">{value}</span>
    </div>
  );
}
