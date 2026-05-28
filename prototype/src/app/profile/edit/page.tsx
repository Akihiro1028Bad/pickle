"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { RequireAuth } from "@/components/RequireAuth";
import { ProfileForm, type ProfileValues } from "@/components/ProfileForm";

export default function ProfileEditPage() {
  return (
    <RequireAuth>
      <ProfileEdit />
    </RequireAuth>
  );
}

function ProfileEdit() {
  const router = useRouter();
  const { user, updateProfile } = useApp();

  const onSubmit = (v: ProfileValues) => {
    updateProfile({ ...v, profileComplete: true });
    router.push("/profile");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <button
          onClick={() => router.back()}
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-white/10 bg-surface text-base text-ink"
        >
          ‹
        </button>
        <span className="font-ja text-[15px] font-bold text-ink">プロフィール編集</span>
        <span className="h-[34px] w-[34px]" />
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10 pt-2">
        <ProfileForm
          initial={{
            name: user?.name ?? "",
            level: user?.level ?? "",
            dupr: user?.dupr ?? "",
            bio: user?.bio ?? "",
            area: user?.area ?? "",
            availability: user?.availability ?? [],
            avatarUrl: user?.avatarUrl,
          }}
          submitLabel="保存する"
          onSubmit={onSubmit}
        />
      </main>
    </div>
  );
}
