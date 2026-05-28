"use client";

import { useState } from "react";

/** 通報理由（管理画面の通報カテゴリに対応） */
export const REPORT_REASONS = [
  "スパム・宣伝／外部サービスへの誘導",
  "迷惑行為・ハラスメント",
  "なりすまし・虚偽情報",
  "不適切・不快な内容",
  "その他",
] as const;

export type ReportTargetType = "post" | "dm" | "user" | "profile";

interface ReportSheetProps {
  /** 通報対象の種類 */
  targetType: ReportTargetType;
  /** 通報対象の表示名（例: 投稿者名・スレッド名） */
  targetLabel: string;
  onClose: () => void;
  /** 送信時のコールバック（プロトタイプでは記録用） */
  onSubmit?: (reason: string, detail: string) => void;
}

const TYPE_LABEL: Record<ReportTargetType, string> = {
  post: "投稿",
  dm: "メッセージ",
  user: "ユーザー",
  profile: "プロフィール",
};

export function ReportSheet({ targetType, targetLabel, onClose, onSubmit }: ReportSheetProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!reason) return;
    onSubmit?.(reason, detail.trim());
    setDone(true);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* 背景オーバーレイ */}
      <button
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      {/* シート本体 */}
      <div className="relative max-h-[88%] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />

        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-2xl">
              ✓
            </div>
            <div className="font-ja text-[15px] font-bold text-ink">通報を受け付けました</div>
            <p className="mt-2 font-ja text-[12px] leading-relaxed text-muted">
              ご報告ありがとうございます。運営が内容を確認し、必要に応じて対応します。
            </p>
            <button
              onClick={onClose}
              className="mt-5 h-11 w-full rounded-md bg-accent font-ja text-sm font-extrabold text-on-accent"
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            <div className="font-ja text-[15px] font-bold text-ink">{TYPE_LABEL[targetType]}を通報</div>
            <p className="mt-1 font-ja text-[11px] leading-relaxed text-muted">
              対象：<span className="text-ink-2">{targetLabel}</span>
              <br />
              通報内容は運営のみが確認します。相手には通知されません。
            </p>

            {/* 理由選択 */}
            <div className="mt-4 flex flex-col gap-2">
              {REPORT_REASONS.map((r) => {
                const on = reason === r;
                return (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left font-ja text-[13px] ${
                      on
                        ? "border-accent bg-accent/[0.08] text-ink"
                        : "border-white/10 bg-bg text-ink-2 hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border ${
                        on ? "border-accent bg-accent text-on-accent" : "border-white/25"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </span>
                    {r}
                  </button>
                );
              })}
            </div>

            {/* 詳細（任意） */}
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="詳細があれば記入してください（任意）"
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-bg px-3 py-2.5 font-ja text-[12px] leading-relaxed text-ink outline-none placeholder:text-faint focus:border-accent/40"
            />

            {/* アクション */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="h-11 flex-1 rounded-md border border-white/12 bg-surface font-ja text-sm font-bold text-ink-2"
              >
                キャンセル
              </button>
              <button
                onClick={submit}
                disabled={!reason}
                className="h-11 flex-[1.4] rounded-md bg-ember font-ja text-sm font-extrabold text-white disabled:bg-white/10 disabled:text-faint"
              >
                通報する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
