"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { RequireAuth } from "@/components/RequireAuth";

export default function MessagesPage() {
  return (
    <RequireAuth>
      <MessagesList />
    </RequireAuth>
  );
}

function MessagesList() {
  const { threads } = useApp();
  // 運営サポートを最上部に固定
  const sorted = [...threads].sort((a, b) => Number(!!b.official) - Number(!!a.official));

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-3">
        <span className="font-display text-[22px] font-medium tracking-tight text-ink">メッセージ</span>
        <button className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-surface text-sm text-ink-2">
          ✎
        </button>
      </header>

      <main className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-28">
        {sorted.map((t) => (
          <Link
            key={t.id}
            href={`/messages/${t.id}`}
            className={`flex items-center gap-2.5 rounded-lg border p-3 ${
              t.official
                ? "border-accent/30 bg-accent/[0.05]"
                : t.unread
                  ? "border-accent/35 bg-surface"
                  : "border-white/8 bg-surface"
            }`}
          >
            <Avatar name={t.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1.5 font-ja text-[13px] font-bold text-ink">
                  {t.name}
                  {t.official && (
                    <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-on-accent">
                      公式
                    </span>
                  )}
                </span>
                <span className="font-display text-[10px] italic text-faint">{t.time}</span>
              </div>
              <div className="mt-1 truncate font-ja text-[11px] text-muted">{t.preview}</div>
              {t.meta && (
                <div className="mt-1 inline-flex max-w-full rounded-full bg-bg px-2 py-0.5 font-ja text-[10px] font-bold text-faint">
                  <span className="truncate">{t.meta}</span>
                </div>
              )}
            </div>
            {t.unread ? (
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ember text-[11px] font-bold text-white">
                {t.unread}
              </span>
            ) : null}
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
