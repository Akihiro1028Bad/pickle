"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

// PBT の LaBOLA 予約カレンダーを iframe で埋め込み。
//   embed=normal で埋め込み表示、tab_name=すべて で全コートタブを初期表示。
const LABOLA_CALENDAR_URL =
  "https://yoyaku.labola.jp/r/shop/3473/calendar/?embed=normal&tab_name=すべて";

export default function CourtPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <span className="font-ja text-[15px] font-bold text-ink">PBT コート空き状況</span>
        <span className="rounded-full border border-white/10 bg-surface px-2.5 py-1 font-display text-[10px] font-bold tracking-widest text-accent">
          OFFICIAL
        </span>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-44">
        {/* LaBOLA 予約カレンダー（レスポンシブ iframe） */}
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white">
          <iframe
            src={LABOLA_CALENDAR_URL}
            title="PBT コート予約カレンダー（LaBOLA）"
            className="h-[560px] w-full border-0"
            loading="lazy"
          />
        </div>

        <p className="mt-3 font-ja text-[11px] leading-relaxed text-muted">
          ※ 空き状況・ご予約は LaBOLA の予約カレンダーをご利用ください。
        </p>
      </main>

      <div className="absolute inset-x-0 bottom-16 border-t border-white/8 bg-surface px-4 pb-3 pt-3">
        <Link
          href="/compose"
          className="block text-center font-ja text-[12px] font-bold text-accent underline underline-offset-4"
        >
          空き時間で募集を投稿する
        </Link>
        {/* PBTについて 導線（常時表示） */}
        <Link
          href="/about"
          className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-white/8 bg-bg px-3 py-2 transition hover:border-accent/40"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-court text-sm text-accent">ⓘ</span>
          <span className="min-w-0 flex-1 font-ja text-[12px] font-bold text-ink">
            THE PICKLE BANG THEORY とは？
          </span>
          <span className="shrink-0 text-muted">›</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
