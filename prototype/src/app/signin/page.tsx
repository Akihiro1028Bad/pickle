"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useApp } from "@/lib/store";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

function SignInInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const hasNext = params.has("next");
  const nextQuery = hasNext ? `?next=${encodeURIComponent(next)}` : "";

  const { loginWithEmail, loginWithGoogle } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim() && password.trim();

  const onSubmit = () => {
    if (!canSubmit) return;
    loginWithEmail({ email: email.trim() });
    router.replace(next);
  };

  const onGoogle = () => {
    loginWithGoogle();
    router.replace("/onboarding");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <Link
          href={`/login${nextQuery}`}
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-white/10 bg-surface text-base text-ink"
        >
          ‹
        </Link>
        <span className="font-ja text-[15px] font-bold text-ink">ログイン</span>
        <span className="h-[34px] w-[34px]" />
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10">
        <button
          onClick={onGoogle}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-md bg-white text-sm font-bold text-[#1f1f1f]"
        >
          <GoogleMark />
          Googleでログイン
        </button>

        <div className="my-6 flex items-center gap-3 text-muted">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-ja text-[11px]">または</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex flex-col gap-4">
          <Field label="メールアドレス">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </Field>
          <Field label="パスワード">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              className="input"
            />
          </Field>
        </div>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-6 flex h-[50px] w-full items-center justify-center rounded-md bg-accent text-sm font-extrabold text-on-accent disabled:opacity-40"
        >
          ログイン
        </button>

        <Link href={`/signup${nextQuery}`} className="mt-5 block text-center font-ja text-[12px] text-muted">
          アカウントをお持ちでない方は{" "}
          <span className="font-bold text-accent underline underline-offset-4">新規登録</span>
        </Link>
      </main>

      <style>{`
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: var(--color-surface);
          padding: 12px 14px;
          font-family: var(--font-ja);
          font-size: 13px;
          color: var(--color-ink);
          outline: none;
        }
        .input::placeholder { color: var(--color-faint); }
        .input:focus { border-color: rgba(246,255,84,0.5); }
      `}</style>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
