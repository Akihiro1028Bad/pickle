"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";

// NOTE: 仮の空き状況（ダミー）。本番は PBT の LaBOLA 予約ページを
//   Web=iframe / モバイル=WebView で埋め込み、ここを差し替える。
const LABOLA_URL = "https://labola.jp/r/"; // ← PBTの該当予約ページURLに差し替え

const COURTS = ["C1", "C2", "C3"];
const TIMES = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const DATES = [
  { n: "27", d: "今日" },
  { n: "28", d: "水" },
  { n: "29", d: "木" },
  { n: "30", d: "金" },
  { n: "31", d: "土" },
];

export default function CourtPage() {
  const [day, setDay] = useState(0);
  // 仮データ：日付・時間・コートで決まる擬似的な空き状況
  const isFree = (timeIdx: number, courtIdx: number) => (timeIdx + courtIdx + day) % 3 !== 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <span className="font-ja text-[15px] font-bold text-ink">PBT コート空き状況</span>
        <span className="rounded-full border border-white/10 bg-surface px-2.5 py-1 font-display text-[10px] font-bold tracking-widest text-accent">
          OFFICIAL
        </span>
      </header>

      {/* 日付タブ */}
      <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-5 pb-2">
        {DATES.map((dt, i) => (
          <button
            key={dt.n}
            onClick={() => setDay(i)}
            className={`min-w-[50px] shrink-0 rounded-[10px] border px-3 py-2 text-center ${
              i === day ? "border-accent bg-accent text-on-accent" : "border-white/10 bg-surface text-ink"
            }`}
          >
            <div className="font-display text-lg font-medium leading-none">{dt.n}</div>
            <div className={`mt-1 text-[9px] font-bold ${i === day ? "text-on-accent/70" : "text-muted"}`}>{dt.d}</div>
          </button>
        ))}
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-44">
        {/* グリッド見出し */}
        <div className="grid grid-cols-[44px_repeat(3,1fr)] gap-1.5 pb-2">
          <div />
          {COURTS.map((c) => (
            <div key={c} className="rounded-md bg-court py-1.5 text-center font-ja text-[10px] font-bold text-ink">
              {c}
            </div>
          ))}
        </div>

        {TIMES.map((t, ti) => (
          <div key={t} className="mb-1.5 grid grid-cols-[44px_repeat(3,1fr)] items-stretch gap-1.5">
            <div className="flex items-center justify-end pr-1 font-display text-[13px] font-medium text-ink">{t}</div>
            {COURTS.map((c, ci) => {
              const free = isFree(ti, ci);
              return (
                <div
                  key={c}
                  className={`flex h-9 items-center justify-center rounded-lg font-ja text-[10px] font-bold ${
                    free ? "border border-white/8 bg-surface text-accent-deep" : "bg-white/5 text-faint"
                  }`}
                >
                  {free ? "空" : "×"}
                </div>
              );
            })}
          </div>
        ))}

        <p className="mt-3 font-ja text-[11px] leading-relaxed text-muted">
          ※ 空き状況は<span className="font-bold text-ink-2">目安（仮表示）</span>です。最新状況・ご予約は LaBOLA でご確認ください。
        </p>

        {/* PBTについて 導線 */}
        <Link
          href="/about"
          className="mt-4 flex items-center gap-3 rounded-lg border border-white/8 bg-surface p-3.5 transition hover:border-accent/40"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-court text-base text-accent">ⓘ</span>
          <div className="min-w-0 flex-1">
            <div className="font-ja text-[13px] font-bold text-ink">THE PICKLE BANG THEORY とは？</div>
            <div className="font-ja text-[11px] text-muted">施設・サービス・アクセスを見る</div>
          </div>
          <span className="shrink-0 text-muted">›</span>
        </Link>
      </main>

      <div className="absolute inset-x-0 bottom-16 border-t border-white/8 bg-surface px-4 pb-3 pt-3">
        <a
          href={LABOLA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-extrabold text-on-accent"
        >
          PBTで予約する ↗
        </a>
        <Link
          href="/compose"
          className="mt-2 block text-center font-ja text-[11px] font-bold text-accent underline underline-offset-4"
        >
          空き時間で募集を投稿する
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
