"use client";

import { REGION_GROUPS } from "@/lib/regions";

interface RegionChipsProps {
  value: string[];
  onChange: (next: string[]) => void;
}

/** 地方ごとにグルーピングした地域の複数選択チップ。投稿作成・一覧フィルタで共用。 */
export function RegionChips({ value, onChange }: RegionChipsProps) {
  const toggle = (r: string) =>
    onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);

  return (
    <div className="flex flex-col gap-3">
      {REGION_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="mb-1.5 font-ja text-[10px] font-bold text-faint">{group.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {group.regions.map((r) => {
              const on = value.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggle(r)}
                  className={`rounded-full border px-2.5 py-1 font-ja text-[12px] font-bold ${
                    on ? "border-accent bg-accent text-on-accent" : "border-white/10 bg-surface text-ink-2"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
