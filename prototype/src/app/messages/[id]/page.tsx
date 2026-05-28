"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { RequireAuth } from "@/components/RequireAuth";
import { ReportSheet } from "@/components/ReportSheet";

export default function ChatPage() {
  return (
    <RequireAuth>
      <Chat />
    </RequireAuth>
  );
}

function Chat() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { threads, sendMessage, receiveMessage, markRead } = useApp();
  const thread = threads.find((t) => t.id === params.id);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const ackedRef = useRef(false);

  useEffect(() => {
    markRead(params.id);
  }, [params.id, markRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  const send = () => {
    const body = text.trim();
    if (!body || !thread) return;
    sendMessage(thread.id, body);
    setText("");
    // 運営サポート窓口は、最初の送信に自動で受付返信（受信体験のデモ）
    if (thread.official && !ackedRef.current) {
      ackedRef.current = true;
      const tid = thread.id;
      setTimeout(() => {
        receiveMessage(
          tid,
          "お問い合わせありがとうございます🥒\n担当者が内容を確認し、こちらのトークでご返信します。営業時間内は通常1営業日以内にお返事します。",
        );
      }, 1200);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-white/8 bg-surface px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="grid h-[30px] w-[30px] place-items-center rounded-full border border-white/10 bg-surface text-sm text-ink"
          >
            ‹
          </button>
          {thread && <Avatar name={thread.name} size="md" />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-ja text-sm font-bold text-ink">
              {thread?.name ?? "DM"}
              {thread?.official && (
                <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-on-accent">
                  公式
                </span>
              )}
            </div>
            <div className="font-ja text-[10px] font-medium text-muted">{thread?.meta ?? ""}</div>
          </div>
          {!thread?.official && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-[30px] w-[30px] place-items-center rounded-full border border-white/10 bg-surface text-sm text-ink"
            >
              ⋯
            </button>
            {menuOpen && (
              <>
                <button
                  aria-label="閉じる"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <div className="absolute right-0 top-9 z-30 w-36 overflow-hidden rounded-lg border border-white/10 bg-surface shadow-lg">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setReporting(true);
                    }}
                    className="block w-full px-4 py-3 text-left font-ja text-[13px] text-ember hover:bg-white/5"
                  >
                    ⚠️ 通報する
                  </button>
                </div>
              </>
            )}
          </div>
          )}
        </div>
      </header>

      {thread ? (
        <>
          <main className="no-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-4 pb-24">
            <div className="text-center font-display text-[11px] italic text-faint">今日</div>
            {thread.messages.length === 0 && (
              <div className="mt-6 text-center font-ja text-[11px] text-faint">
                メッセージを送ってみましょう
              </div>
            )}
            {thread.messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-2 ${m.fromSelf ? "flex-row-reverse" : ""}`}>
                <Avatar name={m.fromSelf ? "あなた" : thread.name} size="sm" />
                <div className="max-w-[72%]">
                  <div
                    className={`whitespace-pre-wrap px-3 py-2 font-ja text-xs leading-relaxed ${
                      m.fromSelf
                        ? "rounded-2xl rounded-br-sm bg-accent font-medium text-on-accent"
                        : "rounded-2xl rounded-bl-sm border border-white/8 bg-surface text-ink"
                    }`}
                  >
                    {m.text}
                  </div>
                  <div
                    className={`px-1 pt-0.5 font-display text-[9px] italic text-faint ${
                      m.fromSelf ? "text-right" : ""
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </main>

          <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 border-t border-white/8 bg-surface px-3.5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5">
            <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-base text-ink-2">
              ＋
            </button>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="メッセージを入力..."
              rows={1}
              className="max-h-24 min-h-[36px] flex-1 resize-none rounded-2xl border border-white/10 bg-surface-2 px-4 py-2.5 font-ja text-xs leading-relaxed text-ink outline-none placeholder:text-faint focus:border-accent/40"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-accent text-sm text-on-accent disabled:bg-white/10 disabled:text-faint"
            >
              ↑
            </button>
          </div>

          {reporting && (
            <ReportSheet
              targetType="dm"
              targetLabel={`${thread.name} さんとのDM`}
              onClose={() => setReporting(false)}
            />
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center font-ja text-sm text-muted">
          スレッドが見つかりませんでした
        </div>
      )}
    </div>
  );
}
