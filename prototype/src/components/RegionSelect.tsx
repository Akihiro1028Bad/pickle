"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_REGIONS, regionLabel } from "@/lib/regions";

interface RegionSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

/** 複数選択できる地域プルダウン（フラットな一覧・チェック式）。投稿作成・一覧フィルタで共用。 */
export function RegionSelect({ value, onChange, placeholder = "地域を選択" }: RegionSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (r: string) =>
    onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);

  const hasValue = value.length > 0;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-3 font-ja text-[13px] ${
          hasValue ? "border-accent/50 bg-surface text-ink" : "border-white/10 bg-surface text-ink-2"
        }`}
      >
        <span className="truncate">📍 {hasValue ? regionLabel(value) : placeholder}</span>
        <span className="shrink-0 text-[10px] text-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-surface p-1 shadow-[0_12px_28px_rgba(0,0,0,0.5)]">
          {hasValue && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mb-1 block w-full rounded-lg px-3 py-1.5 text-left font-ja text-[11px] font-bold text-muted hover:bg-white/5"
            >
              選択をクリア
            </button>
          )}
          {ALL_REGIONS.map((r) => {
            const on = value.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => toggle(r)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-ja text-[13px] hover:bg-white/5"
              >
                <span
                  className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded border text-[10px] ${
                    on ? "border-accent bg-accent text-on-accent" : "border-white/25 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className={on ? "text-ink" : "text-ink-2"}>{r}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
