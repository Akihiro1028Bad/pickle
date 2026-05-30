"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { PbtBadges } from "@/components/PbtBadge";
import { RegionChips } from "@/components/RegionChips";
import { regionLabel } from "@/lib/regions";
import type { Post } from "@/lib/types";

export default function BoardPage() {
  const router = useRouter();
  const { posts, user, authReady, announcements, unreadNewsCount } = useApp();
  const isGuest = authReady && !user;
  const latestNews = announcements[0];

  const onCompose = () => {
    router.push(user ? "/compose" : "/login?next=/compose");
  };

  // 地域フィルタ：未選択＝全件。選択時＝その地域向け＋全国向け（地域未指定）を表示。
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const matchesFilter = (p: Post) => {
    if (regionFilter.length === 0) return true;
    const target = p.regions ?? [];
    if (target.length === 0) return true; // 全国向けは常に表示
    return target.some((r) => regionFilter.includes(r));
  };
  const visible = posts.filter(matchesFilter);

  // 表示順：公式 → おすすめ → 通常
  const official = visible.filter((p) => p.official);
  const featured = visible.filter((p) => p.featured && !p.official);
  const normal = visible.filter((p) => !p.featured && !p.official);

  const renderCard = (p: Post) => {
    const isOfficial = !!p.official;
    const isFeatured = !!p.featured && !isOfficial;
    return (
      <Link
        key={p.id}
        href={`/posts/${p.id}`}
        className={`block rounded-lg border bg-surface p-4 transition hover:bg-surface-2/70 ${
          isOfficial
            ? "border-y border-r border-white/8 border-l-[3px] border-l-accent bg-accent/[0.05]"
            : isFeatured
              ? "border-y border-r border-white/8 border-l-[3px] border-l-accent"
              : "border border-white/8 hover:border-accent/40"
        }`}
      >
        {/* ヘッダ：人 + バッジ + おすすめ + 時刻 */}
        <div className="mb-2 flex items-center gap-2">
          <Avatar name={p.author} size="sm" />
          <span className="font-ja text-xs font-bold text-ink">{p.author}</span>
          {isOfficial ? (
            <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-on-accent">
              ✓ 公式
            </span>
          ) : (
            <PbtBadges badges={p.authorBadges} size="xs" />
          )}
          {isFeatured && (
            <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-on-accent">
              ⭐ おすすめ
            </span>
          )}
          <span className="ml-auto shrink-0 text-[10px] font-medium text-muted">{p.timeAgo}</span>
        </div>
        {/* 本文：2行で省略してスキャンしやすく */}
        <p className="line-clamp-2 font-ja text-[13px] leading-relaxed text-ink-2">{p.body}</p>
        {/* メタ：地域 + 表示時間 */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-ja text-[10px] font-bold ${
              p.regions && p.regions.length > 0
                ? "bg-accent/15 text-accent"
                : "bg-bg text-faint"
            }`}
          >
            📍 {regionLabel(p.regions)}
          </span>
          {p.duration && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 font-ja text-[10px] text-faint">
              🕒 {p.duration}表示
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-3">
        <span className="flex items-center gap-2">
          <Image
            src="/logos/yoko-neon.png"
            alt="THE PICKLE BANG THEORY"
            width={120}
            height={44}
            className="h-[22px] w-auto"
            priority
          />
          <span className="rounded-[3px] bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-on-accent">
            Match
          </span>
        </span>
        <span className="flex items-center gap-2">
          <Link
            href="/news"
            className="relative grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-surface text-sm text-ink-2"
            aria-label="お知らせ"
          >
            🔔
            {unreadNewsCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-surface bg-ember" />
            )}
          </Link>
          {isGuest && (
            <Link
              href="/login"
              className="rounded-full bg-accent px-3.5 py-1.5 text-[11px] font-extrabold text-on-accent"
            >
              ログイン
            </Link>
          )}
        </span>
      </header>

      <main className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-28 pt-1">
        {/* 地域フィルタ */}
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ja text-[12px] font-bold ${
                regionFilter.length > 0 ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-surface text-ink-2"
              }`}
            >
              📍 {regionFilter.length > 0 ? `地域: ${regionLabel(regionFilter)}` : "地域で絞り込み"}
              <span className="text-[10px]">{filterOpen ? "▲" : "▼"}</span>
            </button>
            {regionFilter.length > 0 && (
              <button onClick={() => setRegionFilter([])} className="font-ja text-[11px] font-bold text-muted underline underline-offset-2">
                クリア
              </button>
            )}
          </div>
          {filterOpen && (
            <div className="mt-2 rounded-xl border border-white/10 bg-surface p-3">
              <RegionChips value={regionFilter} onChange={setRegionFilter} />
              <p className="mt-2 font-ja text-[11px] leading-relaxed text-muted">
                選んだ地域向けの投稿＋<span className="font-bold text-ink-2">全国向け</span>の投稿が表示されます。
              </p>
            </div>
          )}
        </div>

        {/* 運営からのお知らせ（最新1件をバナー表示） */}
        {latestNews && (
          <Link
            href="/news"
            className="flex items-center gap-2.5 rounded-lg border border-accent/20 bg-accent/[0.06] px-3.5 py-2.5 transition hover:border-accent/40"
          >
            <span className="text-sm">📢</span>
            <span className="min-w-0 flex-1 truncate font-ja text-[12px] font-bold text-ink">{latestNews.title}</span>
            <span className="shrink-0 font-ja text-[11px] text-accent">お知らせ ›</span>
          </Link>
        )}

        {/* 公式 → おすすめ → 通常 の順で1リスト表示 */}
        {[...official, ...featured, ...normal].map((p) => renderCard(p))}
      </main>

      <button
        onClick={onCompose}
        className="absolute bottom-[84px] right-5 flex h-[46px] items-center gap-2 rounded-full bg-accent px-[18px] text-xs font-extrabold text-on-accent shadow-[0_12px_28px_rgba(246,255,84,0.3)]"
      >
        <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-on-accent text-sm font-extrabold leading-none text-accent">
          +
        </span>
        投稿する
      </button>

      <BottomNav />
    </div>
  );
}
