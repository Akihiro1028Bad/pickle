"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { PbtBadges } from "@/components/PbtBadge";
import { ReportSheet } from "@/components/ReportSheet";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { posts, ensureThreadForAuthor, user, authReady } = useApp();
  const post = posts.find((p) => p.id === params.id);
  const [reporting, setReporting] = useState(false);

  const onReport = () => {
    if (authReady && !user) {
      router.push(`/login?next=${encodeURIComponent(`/posts/${params.id}`)}`);
      return;
    }
    setReporting(true);
  };

  const openDM = () => {
    if (!post) return;
    if (authReady && !user) {
      router.push(`/login?next=${encodeURIComponent(`/posts/${params.id}`)}`);
      return;
    }
    const threadId = ensureThreadForAuthor(post.author, post.level);
    router.push(`/messages/${threadId}`);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <button
          onClick={() => router.back()}
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-white/10 bg-surface text-base text-ink"
        >
          ‹
        </button>
        <span className="font-ja text-[15px] font-bold text-ink">投稿の詳細</span>
        <span className="h-[34px] w-[34px]" />
      </header>

      {post ? (
        <>
          <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-36">
            <div className="flex items-center gap-3 border-b border-white/8 pb-4">
              <Avatar name={post.author} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-ja text-[13px] font-bold text-ink">{post.author}</span>
                  <PbtBadges badges={post.authorBadges} size="xs" />
                </div>
                <div className="mt-0.5 font-ja text-[11px] text-muted">
                  {post.level ?? "中級"} · {post.timeAgo}に投稿
                  {post.duration ? ` · 🕒 ${post.duration}表示` : ""}
                </div>
              </div>
            </div>

            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-white/8 bg-surface p-4 font-ja text-[13px] leading-7 text-ink">
              {post.body}
            </div>

            <div className="rounded-lg border border-white/8 bg-bg p-3">
              <div className="font-ja text-[11px] font-bold text-ink">DMで聞いておくとよさそうなこと</div>
              <p className="mt-1 font-ja text-[11px] leading-relaxed text-muted">
                気になる点があれば、最初のメッセージで軽く確認しておくと当日スムーズです。
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 font-ja text-[11px] text-muted">
                <span>集合時間</span>
                <span>参加枠</span>
                <span>料金・支払い</span>
                <span>レベル感</span>
              </div>
            </div>

            {/* 通報導線 */}
            <button
              onClick={onReport}
              className="mt-4 flex w-full items-center justify-center gap-1.5 py-2 font-ja text-[11px] text-faint hover:text-muted"
            >
              ⚠️ この投稿を通報する
            </button>
          </main>

          <div className="absolute inset-x-0 bottom-0 border-t border-white/8 bg-surface px-4 pb-4 pt-3">
            {!user && authReady && (
              <div className="mb-2 text-center font-ja text-[11px] text-muted">
                DMにはログインが必要です。掲示板閲覧はゲストのまま使えます。
              </div>
            )}
            <button
              onClick={openDM}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-extrabold text-on-accent shadow-[0_6px_20px_rgba(246,255,84,0.28)]"
            >
              💬 {user ? "DMで相談する" : "ログインしてDMで相談する"}
            </button>
          </div>

          {reporting && (
            <ReportSheet
              targetType="post"
              targetLabel={`${post.author} さんの投稿`}
              onClose={() => setReporting(false)}
            />
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center font-ja text-sm text-muted">
          投稿が見つかりませんでした
        </div>
      )}
    </div>
  );
}
