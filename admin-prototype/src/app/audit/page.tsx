"use client";

import { useAdmin } from "@/lib/store";
import { PageHeader, Card } from "@/components/ui";

export default function AuditPage() {
  const { audit } = useAdmin();

  return (
    <div className="max-w-3xl">
      <PageHeader title="監査ログ" desc="管理操作の記録（追記専用・改ざん不可を想定）。" />

      {/* PC: テーブル */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/8 font-ja text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-semibold">日時</th>
              <th className="px-4 py-3 font-semibold">操作者</th>
              <th className="px-4 py-3 font-semibold">アクション</th>
              <th className="px-4 py-3 font-semibold">対象</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-b border-white/5 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-ja text-[12px] text-muted">{a.at}</td>
                <td className="whitespace-nowrap px-4 py-3 font-ja text-[12px] text-ink-2">{a.actor}</td>
                <td className="px-4 py-3 font-ja text-[12px] font-bold text-ink">{a.action}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-faint">{a.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* モバイル: カード */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {audit.map((a) => (
          <Card key={a.id} className="p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-ja text-[13px] font-bold text-ink">{a.action}</span>
              <span className="shrink-0 font-ja text-[11px] text-muted">{a.at}</span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-faint">{a.target}</div>
            <div className="mt-1 font-ja text-[11px] text-ink-2">操作者: {a.actor}</div>
          </Card>
        ))}
      </div>
      <p className="mt-3 font-ja text-[11px] text-faint">※ 管理画面の各操作（投稿の非表示、通報対応、設定変更など）がここに自動追記されます（プロトタイプはメモリ保持）。</p>
    </div>
  );
}
