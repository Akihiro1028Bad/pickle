"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { Card, StatusBadge, PbtBadgeChips } from "@/components/ui";
import { PBT_BADGES, type MemberStatus } from "@/lib/mock";

const ACTIONS: { status: MemberStatus; label: string; tone: string }[] = [
  { status: "member", label: "会員に戻す", tone: "bg-surface-2 text-ink hover:bg-white/10" },
  { status: "suspended", label: "一時停止", tone: "bg-[#fbbf24]/15 text-[#fbbf24] hover:bg-[#fbbf24]/25" },
  { status: "banned", label: "BAN", tone: "bg-ember/15 text-ember hover:bg-ember/25" },
];

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { members, setMemberStatus, setMemberMemo, toggleMemberBadge, setMemberBadges, posts } = useAdmin();
  const m = members.find((x) => x.id === id);
  const [memo, setMemo] = useState(m?.memo ?? "");
  const [badgeEnabled, setBadgeEnabled] = useState((m?.pbtBadges?.length ?? 0) > 0);
  const userPosts = posts.filter((p) => p.authorId === id);

  if (!m) {
    return (
      <div>
        <Link href="/members" className="font-ja text-[12px] text-accent">← 会員一覧</Link>
        <p className="mt-6 font-ja text-sm text-muted">会員が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link href="/members" className="font-ja text-[12px] text-accent">← 会員一覧</Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-ja text-xl font-bold text-ink">{m.name} <span className="ml-1 align-middle"><StatusBadge status={m.status} /></span></h1>
          <p className="mt-1 font-ja text-[13px] text-muted">{m.handle} · {m.email}</p>
          {m.pbtBadges && m.pbtBadges.length > 0 && (
            <div className="mt-2"><PbtBadgeChips badges={m.pbtBadges} /></div>
          )}
          {m.warnings && m.warnings.length > 0 && (
            <div className="mt-2">
              <span className="rounded-md bg-[#fbbf24]/15 px-2 py-1 font-ja text-[11px] font-bold text-[#fbbf24]">
                ⚠ 運営警告 {m.warnings.length}回
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.status}
              onClick={() => setMemberStatus(m.id, a.status)}
              disabled={m.status === a.status}
              className={`rounded-lg px-3 py-2 font-ja text-[12px] font-bold disabled:opacity-30 ${a.tone}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 font-ja text-[12px] font-bold text-muted">プロフィール</div>
          <Field label="レベル">{m.level}</Field>
          <Field label="DUPR">{m.dupr ?? "—"}</Field>
          <Field label="ログイン">{m.provider}</Field>
        </Card>
        <Card className="p-4">
          <div className="mb-2 font-ja text-[12px] font-bold text-muted">アクティビティ</div>
          <Field label="登録日">{m.joinedAt}</Field>
          <Field label="最終アクティブ">{m.lastActiveAt}</Field>
          <Field label="投稿数">{userPosts.length} 件</Field>
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <div className="mb-1 font-ja text-[12px] font-bold text-muted">PBT認定バッジ</div>
        <div className="mb-3 font-ja text-[11px] text-faint">この会員にPBTバッジを付けるかどうかを選びます。</div>

        {/* つける / つけない */}
        <div className="mb-3 inline-flex rounded-lg border border-white/10 p-0.5">
          <button
            onClick={() => {
              setBadgeEnabled(false);
              if (m.pbtBadges?.length) setMemberBadges(m.id, []);
            }}
            className={`rounded-md px-4 py-1.5 font-ja text-[12px] font-bold ${
              !badgeEnabled ? "bg-accent text-on-accent" : "text-ink-2 hover:text-ink"
            }`}
          >
            つけない
          </button>
          <button
            onClick={() => setBadgeEnabled(true)}
            className={`rounded-md px-4 py-1.5 font-ja text-[12px] font-bold ${
              badgeEnabled ? "bg-accent text-on-accent" : "text-ink-2 hover:text-ink"
            }`}
          >
            つける
          </button>
        </div>

        {/* 「つける」のときだけバッジ選択を表示 */}
        {badgeEnabled && (
          <div>
            <div className="mb-2 font-ja text-[11px] text-faint">
              付与するバッジを選択（複数可）。アプリの投稿・プロフィールに表示されます。
            </div>
            <div className="flex flex-wrap gap-2">
              {PBT_BADGES.map((b) => {
                const on = m.pbtBadges?.includes(b) ?? false;
                return (
                  <button
                    key={b}
                    onClick={() => toggleMemberBadge(m.id, b)}
                    className={`rounded-lg border px-3 py-2 font-ja text-[12px] font-bold ${
                      on ? "border-accent bg-accent text-on-accent" : "border-white/10 bg-surface text-ink-2 hover:text-ink"
                    }`}
                  >
                    {on ? "✓ " : ""}PBT{b}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {m.warnings && m.warnings.length > 0 && (
        <Card className="mt-4 p-4">
          <div className="mb-2 flex items-center gap-2 font-ja text-[12px] font-bold text-muted">
            <span className="text-[#fbbf24]">⚠ 運営警告履歴</span>
            <span className="rounded bg-[#fbbf24]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#fbbf24]">{m.warnings.length}回</span>
          </div>
          <div className="flex flex-col divide-y divide-white/8">
            {m.warnings.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 flex-1 font-ja text-[12px] text-ink-2">{w.reason}</span>
                <span className="shrink-0 font-ja text-[11px] text-faint">{w.at}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 font-ja text-[11px] text-faint">
            ※ 通報対応で「警告を送って解決」すると累積します。一定回数で一時停止・BANを検討。
          </div>
        </Card>
      )}

      <Card className="mt-4 p-4">
        <div className="mb-2 font-ja text-[12px] font-bold text-muted">運営メモ</div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={() => setMemoSafe(m.id, memo, setMemberMemo)}
          placeholder="対応履歴・注意点など"
          className="min-h-[80px] w-full rounded-lg border border-white/10 bg-surface px-3 py-2 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
        />
        <div className="mt-1 font-ja text-[11px] text-faint">フォーカスを外すと保存（プロトタイプはメモリ保持）</div>
      </Card>

      {userPosts.length > 0 && (
        <Card className="mt-4 p-4">
          <div className="mb-2 font-ja text-[12px] font-bold text-muted">この会員の投稿</div>
          <div className="flex flex-col divide-y divide-white/8">
            {userPosts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <StatusBadge status={p.status} />
                <span className="min-w-0 flex-1 truncate font-ja text-[12px] text-ink-2">{p.body}</span>
                <span className="font-ja text-[11px] text-faint">{p.createdAt}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function setMemoSafe(id: string, memo: string, fn: (id: string, memo: string) => void) {
  fn(id, memo);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
      <span className="font-ja text-[12px] text-muted">{label}</span>
      <span className="font-ja text-[13px] text-ink">{children}</span>
    </div>
  );
}
