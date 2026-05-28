"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

const ALLOW = ["/onboarding", "/login", "/signup"];

/**
 * ログイン済みだがプロフィール未設定のユーザーを、
 * どの画面から来てもオンボーディングへ誘導する。
 */
export function ProfileGate() {
  const { user, authReady } = useApp();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authReady && user && !user.profileComplete && !ALLOW.includes(path)) {
      router.replace("/onboarding");
    }
  }, [authReady, user, path, router]);

  return null;
}
