"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  desc?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, desc, children, footer }: ModalProps) {
  // ESCで閉じる + 背面スクロールを止める
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
          <div>
            <h2 className="font-ja text-[15px] font-bold text-ink">{title}</h2>
            {desc && <p className="mt-0.5 font-ja text-[12px] text-muted">{desc}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-white/8 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
