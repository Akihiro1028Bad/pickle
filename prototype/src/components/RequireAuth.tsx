"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

/**
 * Wrap protected page content. Guests are bounced to /login with a `next`
 * param so they return here after authenticating.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useApp();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (authReady && !user) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [authReady, user, path, router]);

  if (!authReady || !user) {
    return (
      <div className="flex h-full items-center justify-center font-ja text-sm text-muted">
        読み込み中…
      </div>
    );
  }

  return <>{children}</>;
}
