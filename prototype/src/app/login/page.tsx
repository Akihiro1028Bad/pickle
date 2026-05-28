"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useApp } from "@/lib/store";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const hasNext = params.has("next");
  const { user, authReady } = useApp();

  const nextQuery = hasNext ? `?next=${encodeURIComponent(next)}` : "";

  useEffect(() => {
    if (authReady && user) router.replace(user.profileComplete ? next : "/onboarding");
  }, [authReady, user, next, router]);

  return (
    <div className="app-glow flex h-full flex-col px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Image
          src="/logos/yoko-neon.png"
          alt="THE PICKLE BANG THEORY"
          width={220}
          height={82}
          className="mb-5 h-auto w-[180px] drop-shadow-[0_0_28px_rgba(48,110,195,0.45)]"
          priority
        />
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.12em] text-ink">
          <span className="text-accent">Match</span>
        </h1>
        <p className="mt-3 font-ja text-[13px] leading-relaxed text-muted">
          {hasNext ? "この操作にはログインが必要です。" : "PBT公式マッチング。"}
          <br />
          {hasNext ? "ログイン後、元の画面に戻れます。" : "一緒に打つ仲間を、30秒で見つけよう。"}
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-10">
        {/* 主導線：ログイン */}
        <Link
          href={`/signin${nextQuery}`}
          className="flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-extrabold text-on-accent"
        >
          ログイン
        </Link>

        {/* 主導線：新規登録 */}
        <Link
          href={`/signup${nextQuery}`}
          className="flex h-12 w-full items-center justify-center rounded-md border border-white/15 bg-surface text-sm font-bold text-ink"
        >
          新規登録
        </Link>

        {/* 従導線：ゲスト */}
        <Link
          href="/"
          className="mt-1 text-center font-ja text-[12px] font-bold text-muted underline underline-offset-4"
        >
          ゲストとして見る（掲示板・コートのみ）
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
