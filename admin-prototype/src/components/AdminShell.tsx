"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const path = usePathname();

  // ルート遷移で閉じる
  useEffect(() => {
    setDrawerOpen(false);
  }, [path]);

  // ドロワー表示中は ESC で閉じる＋背面スクロールを止める
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      {/* PC: 固定サイドバー */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* モバイル/タブレット: ドロワー */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex max-w-[85%]">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/8 bg-surface/60 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="メニューを開く"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink hover:bg-white/5 lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M1.75 4h12.5a.75.75 0 0 0 0-1.5H1.75a.75.75 0 0 0 0 1.5Zm0 4.75h12.5a.75.75 0 0 0 0-1.5H1.75a.75.75 0 0 0 0 1.5Zm0 4.75h12.5a.75.75 0 0 0 0-1.5H1.75a.75.75 0 0 0 0 1.5Z" />
              </svg>
            </button>
            <span className="font-ja text-[12px] text-muted">PBT Match 運営管理画面</span>
          </div>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 font-display text-[10px] font-bold tracking-widest text-accent">
            PROTOTYPE
          </span>
        </div>
        <main className="no-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
