import type { ReactNode } from "react";
import type { PbtBadge } from "@/lib/mock";

type Tone = "neutral" | "ok" | "warn" | "danger" | "accent" | "info";

const PBT_BADGE_STYLE: Record<PbtBadge, string> = {
  認定: "border-accent/40 bg-accent/15 text-accent",
  スタッフ: "border-[#306ec3]/45 bg-[#306ec3]/20 text-[#7fb0ff]",
  認定コーチ: "border-[#306ec3]/45 bg-[#306ec3]/20 text-[#7fb0ff]",
  契約選手: "border-ember/40 bg-ember/15 text-ember",
};

/** 会員・投稿者に付与されたPBT公式バッジ（"PBT" + ラベル） */
export function PbtBadgeChips({ badges }: { badges?: PbtBadge[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {badges.map((b) => (
        <span
          key={b}
          className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none ${PBT_BADGE_STYLE[b]}`}
        >
          ✓ PBT{b}
        </span>
      ))}
    </span>
  );
}

const TONES: Record<Tone, string> = {
  neutral: "bg-white/8 text-ink-2",
  ok: "bg-[#4ade80]/15 text-[#4ade80]",
  warn: "bg-[#fbbf24]/15 text-[#fbbf24]",
  danger: "bg-ember/15 text-ember",
  accent: "bg-accent/15 text-accent",
  info: "bg-[#306ec3]/20 text-[#7fb0ff]",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-surface ${className}`}>{children}</div>
  );
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-ja text-xl font-bold text-ink">{title}</h1>
        {desc && <p className="mt-1 font-ja text-[13px] text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_TONE: Record<string, Tone> = {
  // member
  member: "ok",
  guest: "neutral",
  suspended: "warn",
  banned: "danger",
  withdrawn: "neutral",
  // post
  open: "ok",
  closed: "neutral",
  hidden: "danger",
  // report
  in_progress: "info",
  resolved: "ok",
  rejected: "neutral",
  // inquiry
  done: "ok",
  // announcement
  published: "ok",
  draft: "warn",
  // admin user
  active: "ok",
  disabled: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  member: "会員",
  guest: "ゲスト",
  suspended: "一時停止",
  banned: "BAN",
  withdrawn: "退会",
  open: "公開中",
  closed: "クローズ",
  hidden: "非表示",
  in_progress: "対応中",
  resolved: "解決",
  rejected: "却下",
  done: "完了",
  published: "公開",
  draft: "下書き",
  active: "有効",
  disabled: "無効",
};

export function StatusBadge({ status, openLabel }: { status: string; openLabel?: string }) {
  const label = status === "open" && openLabel ? openLabel : (STATUS_LABEL[status] ?? status);
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{label}</Badge>;
}

const SEV_TONE: Record<string, Tone> = { high: "danger", medium: "warn", low: "neutral" };
export function SeverityBadge({ level }: { level: "low" | "medium" | "high" }) {
  const label = level === "high" ? "高" : level === "medium" ? "中" : "低";
  return <Badge tone={SEV_TONE[level]}>重大度 {label}</Badge>;
}
