"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { PbtBadges } from "@/components/PbtBadge";
import { RequireAuth } from "@/components/RequireAuth";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}

function Profile() {
  const router = useRouter();
  const { user, logout } = useApp();
  const name = user?.name ?? "あなた";
  const level = user?.level ?? "未設定";
  const dupr = user?.dupr;

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-court to-court-2 px-5 pb-6 pt-5 text-white">
        <div className="mb-5 flex items-center justify-between font-display text-xs italic opacity-70">
          <span>Profile</span>
          <Link
            href="/profile/edit"
            className="rounded-full bg-white/10 px-3 py-1.5 font-ja text-[11px] font-bold not-italic text-white backdrop-blur"
          >
            編集
          </Link>
        </div>
        <Avatar name={name} src={user?.avatarUrl} size="xl" className="mb-3 ring-2 ring-white/15" />
        <div className="font-display text-2xl font-medium tracking-tight">{name}</div>
        <div className="font-display text-xs italic opacity-60">{user?.handle ?? "@guest"}</div>
        {user?.badges && user.badges.length > 0 && (
          <div className="mt-2">
            <PbtBadges badges={user.badges} />
          </div>
        )}
        {user?.bio && <p className="mt-3 max-w-[90%] font-ja text-[12px] leading-relaxed text-white/85">{user.bio}</p>}
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-4">
        <div className="mb-2.5 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">レベル</div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-surface p-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-deep font-display text-xl font-bold italic text-on-accent">
            {[...level][0] ?? "—"}
          </div>
          <div>
            <div className="font-ja text-[13px] font-bold text-ink">{level}</div>
            <div className="font-display text-[11px] italic text-muted">
              DUPR <span className="font-bold not-italic text-accent">{dupr ?? "—"}</span> · doubles
            </div>
          </div>
        </div>

        {(user?.area || (user?.availability && user.availability.length > 0)) && (
          <>
            <div className="mb-2.5 mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
              プレイ情報
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-surface p-3">
              {user?.area && (
                <div>
                  <div className="font-ja text-[10px] font-bold text-muted">よく打つエリア</div>
                  <div className="mt-0.5 font-ja text-[13px] text-ink">{user.area}</div>
                </div>
              )}
              {user?.availability && user.availability.length > 0 && (
                <div>
                  <div className="font-ja text-[10px] font-bold text-muted">よく空いている時間</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {user.availability.map((slot) => (
                      <span key={slot} className="rounded-full border border-white/10 bg-bg px-2 py-1 font-ja text-[11px] font-bold text-ink-2">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {user?.email && (
          <>
            <div className="mb-2.5 mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
              アカウント
            </div>
            <div className="rounded-2xl border border-white/8 bg-surface p-3 font-ja text-[12px] text-ink-2">
              {user.email}
              <span className="ml-2 text-[10px] text-faint">
                {user.provider === "google" ? "Google連携" : "メール登録"}
              </span>
            </div>
          </>
        )}

        <div className="mb-2.5 mt-6 font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
          サポート
        </div>
        <Link
          href="/messages/t-support"
          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-surface p-3.5 transition hover:border-accent/40"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-court text-base text-accent">💬</span>
          <div className="min-w-0 flex-1">
            <div className="font-ja text-[13px] font-bold text-ink">運営に問い合わせる</div>
            <div className="font-ja text-[11px] text-muted">予約・料金・不具合・アカウントなど</div>
          </div>
          <span className="shrink-0 text-muted">›</span>
        </Link>

        <button
          onClick={onLogout}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-md border border-white/15 bg-surface text-sm font-bold text-ember"
        >
          ログアウト
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
