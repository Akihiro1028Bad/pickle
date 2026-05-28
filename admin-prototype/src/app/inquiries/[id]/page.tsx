"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { Card, StatusBadge } from "@/components/ui";
import type { InquiryStatus } from "@/lib/mock";

const NEXT: Record<InquiryStatus, { to: InquiryStatus; label: string } | null> = {
  open: { to: "in_progress", label: "対応中にする" },
  in_progress: { to: "done", label: "完了にする" },
  done: null,
};

const TEMPLATES = [
  "ご連絡ありがとうございます。確認のうえ折り返します。",
  "お手数ですが、対象の会員名・日時を教えていただけますか？",
  "対応が完了しました。ご不明点があれば改めてご連絡ください。",
];

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { inquiries, replyInquiry, setInquiryStatus } = useAdmin();
  const iq = inquiries.find((x) => x.id === id);
  const [text, setText] = useState("");

  if (!iq) {
    return (
      <div>
        <Link href="/inquiries" className="font-ja text-[12px] text-accent">← 問い合わせ一覧</Link>
        <p className="mt-6 font-ja text-sm text-muted">問い合わせが見つかりません</p>
      </div>
    );
  }

  const next = NEXT[iq.status];
  const messages = iq.messages ?? [{ id: "fallback", from: "user" as const, text: iq.body, at: iq.createdAt }];

  const send = () => {
    const body = text.trim();
    if (!body) return;
    replyInquiry(iq.id, body);
    setText("");
  };

  return (
    <div className="max-w-3xl">
      <Link href="/inquiries" className="font-ja text-[12px] text-accent">← 問い合わせ一覧</Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-ja text-xl font-bold text-ink">{iq.subject}</h1>
          <p className="mt-1 font-ja text-[12px] text-muted">{iq.user} · {iq.createdAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={iq.status} />
          {next && (
            <button
              onClick={() => setInquiryStatus(iq.id, next.to)}
              className="rounded-lg bg-surface-2 px-3 py-2 font-ja text-[12px] font-bold text-ink-2 hover:text-ink"
            >
              {next.label}
            </button>
          )}
        </div>
      </div>

      {/* 会話 */}
      <Card className="mt-4 p-4">
        <div className="mb-3 font-ja text-[12px] font-bold text-muted">やり取り</div>
        <div className="flex flex-col gap-2.5">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%]">
                <div className="mb-0.5 font-ja text-[10px] text-faint">
                  {m.from === "admin" ? "運営" : iq.user} · {m.at}
                </div>
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2 font-ja text-[13px] leading-relaxed ${
                    m.from === "admin"
                      ? "rounded-br-sm bg-accent font-medium text-on-accent"
                      : "rounded-bl-sm border border-white/8 bg-bg text-ink"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 返信 */}
      <Card className="mt-4 p-4">
        <div className="mb-2 font-ja text-[12px] font-bold text-muted">返信する</div>
        <div className="mb-2 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => setText(t)}
              className="rounded-lg border border-white/10 bg-bg px-2.5 py-1.5 font-ja text-[11px] text-ink-2 hover:text-ink"
            >
              {t.length > 18 ? `${t.slice(0, 18)}…` : t}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="返信内容を入力（ユーザーのアプリ内トークに届きます）"
          className="min-h-[90px] w-full rounded-lg border border-white/10 bg-bg px-3 py-2 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="font-ja text-[11px] text-faint">送信内容は監査ログに記録されます。</span>
          <button
            onClick={send}
            disabled={!text.trim()}
            className="rounded-lg bg-accent px-5 py-2 font-ja text-[13px] font-extrabold text-on-accent disabled:bg-white/10 disabled:text-faint"
          >
            返信を送信
          </button>
        </div>
      </Card>
    </div>
  );
}
