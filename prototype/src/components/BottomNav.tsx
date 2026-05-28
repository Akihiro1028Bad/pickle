"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

const items = [
  { href: "/", label: "掲示板", icon: "○", match: (p: string) => p === "/" || p.startsWith("/posts") || p.startsWith("/compose") },
  { href: "/court", label: "コート", icon: "⏱", match: (p: string) => p.startsWith("/court") },
  { href: "/messages", label: "メッセージ", icon: "◇", match: (p: string) => p.startsWith("/messages") },
  { href: "/profile", label: "プロフィール", icon: "△", match: (p: string) => p.startsWith("/profile") },
];

export function BottomNav() {
  const path = usePathname();
  const { threads } = useApp();
  const hasUnread = threads.some((t) => t.unread);
  return (
    <nav className="relative z-10 flex h-16 shrink-0 items-start border-t border-white/8 bg-surface pt-2">
      {items.map((it) => {
        const active = it.match(path);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`relative flex flex-1 flex-col items-center gap-[3px] font-ja text-[9px] font-bold tracking-wide ${
              active ? "text-ink" : "text-faint"
            }`}
          >
            <span className="grid h-[22px] w-[22px] place-items-center text-sm">{it.icon}</span>
            <span>{it.label}</span>
            {active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent" />}
            {it.href === "/messages" && hasUnread && (
              <span className="absolute right-[31%] top-0 h-2 w-2 rounded-full border border-surface bg-ember" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
