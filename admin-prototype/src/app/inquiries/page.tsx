"use client";

import Link from "next/link";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card, StatusBadge } from "@/components/ui";

export default function InquiriesPage() {
  const { inquiries } = useAdmin();

  return (
    <div className="max-w-3xl">
      <PageHeader title="問い合わせ" desc={`未対応 ${inquiries.filter((i) => i.status !== "done").length} 件`} />

      <div className="flex flex-col gap-3">
        {inquiries.map((iq) => {
          const replyCount = (iq.messages ?? []).filter((m) => m.from === "admin").length;
          const last = (iq.messages ?? [])[(iq.messages?.length ?? 1) - 1];
          return (
            <Link key={iq.id} href={`/inquiries/${iq.id}`} className="block">
              <Card className="p-4 transition hover:border-accent/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-ja text-[14px] font-bold text-ink">{iq.subject}</span>
                    {replyCount > 0 && (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 font-ja text-[10px] font-bold text-muted">
                        返信 {replyCount}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={iq.status} />
                </div>
                <p className="mt-1 truncate font-ja text-[12px] leading-relaxed text-ink-2">
                  {last ? `${last.from === "admin" ? "運営: " : ""}${last.text}` : iq.body}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-ja text-[11px] text-faint">{iq.user} · {iq.createdAt}</div>
                  <span className="font-ja text-[12px] font-bold text-accent">開いて返信 ›</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
