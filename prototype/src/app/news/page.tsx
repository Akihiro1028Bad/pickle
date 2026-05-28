"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function NewsPage() {
  const router = useRouter();
  const { announcements, markNewsRead } = useApp();

  // ページを開いたら既読にする
  useEffect(() => {
    markNewsRead();
  }, [markNewsRead]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <button
          onClick={() => router.back()}
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-white/10 bg-surface text-base text-ink"
        >
          ‹
        </button>
        <span className="font-ja text-[15px] font-bold text-ink">お知らせ</span>
        <span className="rounded-full border border-white/10 bg-surface px-2.5 py-1 font-display text-[10px] font-bold tracking-widest text-accent">
          PBT
        </span>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
        {announcements.length === 0 ? (
          <div className="mt-20 text-center font-ja text-sm text-muted">お知らせはまだありません</div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {announcements.map((a) => (
              <article
                key={a.id}
                className={`rounded-2xl border bg-surface p-4 ${
                  a.important ? "border-accent/25 bg-accent/[0.05]" : "border-white/8"
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  {a.important && (
                    <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-on-accent">
                      重要
                    </span>
                  )}
                  <span className="font-ja text-[11px] text-muted">{a.publishedAt}</span>
                </div>
                <h2 className="font-ja text-[14px] font-bold leading-snug text-ink">{a.title}</h2>
                <p className="mt-1.5 whitespace-pre-wrap font-ja text-[12px] leading-relaxed text-ink-2">{a.body}</p>
              </article>
            ))}
          </div>
        )}

        <p className="mt-5 text-center font-ja text-[11px] text-faint">
          THE PICKLE BANG THEORY 運営からのお知らせ
        </p>
      </main>
    </div>
  );
}
