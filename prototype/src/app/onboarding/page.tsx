"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { ProfileForm, type ProfileValues } from "@/components/ProfileForm";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, authReady, updateProfile } = useApp();

  // 未ログインはログインへ。設定済みならアプリへ。
  useEffect(() => {
    if (!authReady) return;
    if (!user) router.replace("/login");
    else if (user.profileComplete) router.replace("/");
  }, [authReady, user, router]);

  if (!authReady || !user || user.profileComplete) {
    return <div className="flex h-full items-center justify-center font-ja text-sm text-muted">読み込み中…</div>;
  }

  const onSubmit = (v: ProfileValues) => {
    updateProfile({ ...v, profileComplete: true });
    router.replace("/");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-5 pb-2 pt-6">
        <div className="font-display text-xl font-extrabold uppercase tracking-[0.1em] text-ink">
          プロフィール設定
        </div>
        <p className="mt-1 font-ja text-[12px] leading-relaxed text-muted">
          あと少し！レベルなどを設定すると、マッチングがスムーズになります。
        </p>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10 pt-4">
        <ProfileForm
          initial={{ name: user.name, level: user.level ?? "", dupr: user.dupr ?? "", bio: user.bio ?? "", area: user.area ?? "", availability: user.availability ?? [], avatarUrl: user.avatarUrl }}
          submitLabel="この内容で始める"
          onSubmit={onSubmit}
        />
      </main>
    </div>
  );
}
