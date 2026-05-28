"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card } from "@/components/ui";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-accent" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { flags, toggleFlag, labolaUrl, setLabolaUrl } = useAdmin();
  const [url, setUrl] = useState(labolaUrl);
  const urlChanged = url !== labolaUrl;

  const rows: { key: keyof typeof flags; label: string; desc: string }[] = [
    { key: "board", label: "掲示板", desc: "投稿一覧・作成機能のON/OFF" },
    { key: "dm", label: "DM", desc: "メッセージ機能のON/OFF" },
    { key: "court", label: "コート空き状況", desc: "LaBOLA埋め込み表示のON/OFF" },
  ];

  return (
    <div className="max-w-2xl">
      <PageHeader title="設定 / フィーチャーフラグ" desc="機能のON/OFFと外部連携の設定。" />

      <Card className="mb-4 border-ember/25 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-ja text-[13px] font-bold text-ink">緊急制御：メンテナンスモード</div>
            <div className="mt-1 font-ja text-[11px] leading-relaxed text-muted">
              ONにするとアプリ全体を一時停止します。障害対応・移行時のみ使用してください。
            </div>
            {flags.maintenance && <div className="mt-2 font-ja text-[11px] font-bold text-ember">● 現在メンテナンス中</div>}
          </div>
          <Toggle on={flags.maintenance} onClick={() => toggleFlag("maintenance")} />
        </div>
      </Card>

      <Card className="p-2">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between border-b border-white/5 px-3 py-3.5 last:border-0">
            <div>
              <div className="font-ja text-[13px] font-bold text-ink">
                {r.label}
                {r.key === "maintenance" && flags.maintenance && <span className="ml-2 text-[11px] font-bold text-ember">● 稼働中</span>}
              </div>
              <div className="font-ja text-[11px] text-muted">{r.desc}</div>
            </div>
            <Toggle on={flags[r.key]} onClick={() => toggleFlag(r.key)} />
          </div>
        ))}
      </Card>

      <Card className="mt-4 p-4">
        <div className="font-ja text-[13px] font-bold text-ink">LaBOLA 予約ページURL</div>
        <div className="mb-2 font-ja text-[11px] text-muted">コート画面で埋め込み表示するPBTの予約ページURL（未確定）</div>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://labola.jp/r/..."
            className="h-9 flex-1 rounded-lg border border-white/10 bg-surface px-3 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
          />
          <button onClick={() => setLabolaUrl(url)} className="rounded-lg bg-accent px-4 font-ja text-[13px] font-bold text-on-accent">保存</button>
        </div>
        <div className="mt-2 font-ja text-[11px] text-faint">
          保存済み: {labolaUrl}
          {urlChanged && <span className="ml-2 font-bold text-accent">未保存の変更があります</span>}
        </div>
      </Card>
    </div>
  );
}
