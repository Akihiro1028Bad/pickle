"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { Card, StatusBadge, SeverityBadge, Badge } from "@/components/ui";

const TYPE_LABEL: Record<string, string> = { post: "投稿", dm: "DM", user: "ユーザー", profile: "プロフィール" };

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { reports, setReportStatus, warnUser, members, posts } = useAdmin();
  const r = reports.find((x) => x.id === id);
  const [note, setNote] = useState("");

  if (!r) {
    return (
      <div>
        <Link href="/reports" className="font-ja text-[12px] text-accent">← 通報一覧</Link>
        <p className="mt-6 font-ja text-sm text-muted">通報が見つかりません</p>
      </div>
    );
  }

  const flaggedPost = posts.find((p) => r.targetSummary.includes(p.body.slice(0, 12)) || r.targetSummary.includes(p.id));
  // 被通報者（通報者ではない側）。対象要約内の会員名 → 対象投稿の投稿者の順で特定。
  const offender =
    members.find((m) => m.name !== r.reporter && r.targetSummary.includes(m.name)) ??
    (flaggedPost ? members.find((m) => m.id === flaggedPost.authorId) : undefined);
  const remaining = 24 - r.ageHours;
  const canClose = note.trim().length >= 4;

  const act = (status: "resolved" | "rejected" | "in_progress", actionNote?: string) => {
    setReportStatus(r.id, status, [actionNote, note.trim()].filter(Boolean).join(" / "));
    if (status !== "in_progress") router.push("/reports");
  };

  const sendWarning = () => {
    if (offender) warnUser(offender.id, r.reason);
    act("resolved", offender ? `警告送信→${offender.name}` : "警告送信（対象会員未特定）");
  };

  return (
    <div className="max-w-3xl">
      <Link href="/reports" className="font-ja text-[12px] text-accent">← 通報一覧</Link>

      <div className="mt-4 flex items-center gap-2">
        <Badge tone="neutral">{TYPE_LABEL[r.targetType]}</Badge>
        <SeverityBadge level={r.severity} />
        <StatusBadge status={r.status} openLabel="未着手" />
        <span className="font-ja text-[12px] text-muted">{r.createdAt}</span>
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-1 font-ja text-[12px] font-bold text-muted">通報対象</div>
        <div className="font-ja text-[15px] font-bold text-ink">{r.targetSummary}</div>

        {r.targetType === "dm" && (
          <div className="mt-3 rounded-lg border border-white/8 bg-bg p-3 font-ja text-[12px] text-ink-2">
            <div className="mb-1 text-[11px] font-bold text-accent">⚠ 通報されたDMのみ閲覧（閲覧操作は監査ログに記録）</div>
            <p>「何度も誘ってくる。断っても連絡が来て怖いです…」</p>
            <p className="mt-1 text-faint">（前後のメッセージ抜粋を表示。通報外のDMは閲覧不可）</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="font-ja text-[11px] text-muted">理由</div>
            <div className="font-ja text-[13px] text-ink">{r.reason}</div>
          </div>
          <div>
            <div className="font-ja text-[11px] text-muted">通報者</div>
            <div className="font-ja text-[13px] text-ink">{r.reporter}</div>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="mb-3 font-ja text-[12px] font-bold text-muted">判断材料</div>
        <div className="grid grid-cols-2 gap-3">
          <Info label="SLA">{r.status === "resolved" || r.status === "rejected" ? "完了済み" : remaining >= 0 ? `残り ${remaining}h` : `${Math.abs(remaining)}h 超過`}</Info>
          <Info label="対象会員（被通報者）">{offender ? `${offender.name}${offender.warnings?.length ? ` / 警告${offender.warnings.length}回` : ""}` : "未特定"}</Info>
          <Info label="対象投稿">{flaggedPost ? flaggedPost.status : "直接紐付けなし"}</Info>
          <Info label="監査">{r.targetType === "dm" ? "DM閲覧ログ対象" : "通常操作ログ対象"}</Info>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="mb-3 font-ja text-[12px] font-bold text-muted">対応アクション</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="判断理由・対応メモ（解決/却下は4文字以上必須）"
          className="mb-3 min-h-[78px] w-full rounded-lg border border-white/10 bg-bg px-3 py-2 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => act("in_progress")} className="rounded-lg bg-[#306ec3]/20 px-3 py-2 font-ja text-[12px] font-bold text-[#7fb0ff] hover:bg-[#306ec3]/30">対応中にする</button>
          <button disabled={!canClose} onClick={() => act("resolved", "対象を非表示")} className="rounded-lg bg-ember/15 px-3 py-2 font-ja text-[12px] font-bold text-ember hover:bg-ember/25 disabled:opacity-35">対象を非表示にして解決</button>
          <button disabled={!canClose} onClick={sendWarning} className="rounded-lg bg-[#fbbf24]/15 px-3 py-2 font-ja text-[12px] font-bold text-[#fbbf24] hover:bg-[#fbbf24]/25 disabled:opacity-35">警告を送って解決</button>
          <button disabled={!canClose} onClick={() => act("resolved", "ユーザー凍結")} className="rounded-lg bg-ember/15 px-3 py-2 font-ja text-[12px] font-bold text-ember hover:bg-ember/25 disabled:opacity-35">ユーザーを凍結して解決</button>
          <button disabled={!canClose} onClick={() => act("rejected")} className="rounded-lg bg-surface-2 px-3 py-2 font-ja text-[12px] font-bold text-ink-2 hover:text-ink disabled:opacity-35">問題なし（却下）</button>
        </div>
        <div className="mt-3 font-ja text-[11px] text-faint">※ 操作内容は監査ログに記録されます。</div>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/8 bg-bg px-3 py-2">
      <div className="font-ja text-[10px] font-bold text-muted">{label}</div>
      <div className="mt-1 font-ja text-[12px] text-ink">{children}</div>
    </div>
  );
}
