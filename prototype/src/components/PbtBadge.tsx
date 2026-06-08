import type { PbtBadge } from "@/lib/types";

// バッジ種別ごとの配色（PBTブランド配色）
const STYLE: Record<PbtBadge, string> = {
  認定: "border-accent/40 bg-accent/15 text-accent",
  スタッフ: "border-[#306ec3]/45 bg-[#306ec3]/20 text-[#7fb0ff]",
  認定コーチ: "border-[#306ec3]/45 bg-[#306ec3]/20 text-[#7fb0ff]",
  契約選手: "border-ember/40 bg-ember/15 text-ember",
};

interface PbtBadgesProps {
  badges?: PbtBadge[];
  size?: "xs" | "sm";
  className?: string;
}

// PBT認定・契約選手などの資格バッジの表示フラグ。一旦非表示中（true で再表示）。
const SHOW_PBT_BADGES = false;

/** 投稿者・会員に付与されたPBT公式バッジを表示（"PBT" + ラベル） */
export function PbtBadges({ badges, size = "sm", className = "" }: PbtBadgesProps) {
  if (!SHOW_PBT_BADGES) return null;
  if (!badges || badges.length === 0) return null;
  const pad = size === "xs" ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]";
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {badges.map((b) => (
        <span
          key={b}
          className={`inline-flex items-center gap-0.5 rounded-full border font-bold leading-none ${pad} ${STYLE[b]}`}
        >
          ✓ PBT{b}
        </span>
      ))}
    </span>
  );
}
