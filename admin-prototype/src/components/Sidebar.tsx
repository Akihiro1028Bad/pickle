"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/lib/store";
import { ADMIN_ROLE_LABEL } from "@/lib/mock";

const NAV = [
  { href: "/", label: "ダッシュボード", icon: "▦", exact: true },
  { href: "/members", label: "会員管理", icon: "◍" },
  { href: "/posts", label: "投稿管理", icon: "▤" },
  { href: "/reports", label: "通報 / T&S", icon: "⚑", badge: "reports" as const },
  { href: "/announcements", label: "お知らせ", icon: "✦" },
  { href: "/inquiries", label: "問い合わせ", icon: "✉", badge: "inquiries" as const },
  { href: "/admins", label: "管理者", icon: "★" },
  { href: "/settings", label: "設定 / フラグ", icon: "⚙" },
  { href: "/audit", label: "監査ログ", icon: "🛡" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const path = usePathname();
  const { reports, inquiries, currentAdmin } = useAdmin();
  const counts = {
    reports: reports.filter((r) => r.status === "open" || r.status === "in_progress").length,
    inquiries: inquiries.filter((i) => i.status !== "done").length,
  };

  return (
    <aside className="flex w-[232px] shrink-0 flex-col border-r border-white/8 bg-surface">
      <div className="flex items-center gap-2 px-5 py-5">
        <Image src="/logos/yoko-neon.png" alt="PBT" width={110} height={40} className="h-[20px] w-auto" priority />
        <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-on-accent">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((it) => {
          const active = it.exact ? path === it.href : path.startsWith(it.href);
          const badge = it.badge ? counts[it.badge] : 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-ja text-[13px] font-semibold transition-colors ${
                active ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-white/5 hover:text-ink"
              }`}
            >
              <span className="w-4 text-center">{it.icon}</span>
              <span className="flex-1">{it.label}</span>
              {badge > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${
                    active ? "bg-on-accent text-accent" : "bg-ember text-white"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link href="/admins" onClick={onNavigate} className="block border-t border-white/8 px-5 py-4 transition-colors hover:bg-white/5">
        <div className="font-ja text-[12px] font-bold text-ink">{currentAdmin.name}</div>
        <div className="font-ja text-[11px] text-muted">{ADMIN_ROLE_LABEL[currentAdmin.role]}</div>
      </Link>
    </aside>
  );
}
