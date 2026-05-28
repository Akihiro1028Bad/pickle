"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card, StatusBadge } from "@/components/ui";

export default function AnnouncementsPage() {
  const { announcements, addAnnouncement } = useAdmin();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    addAnnouncement(title.trim(), body.trim());
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="お知らせ"
        desc="アプリ内お知らせ。規約改定はバージョン管理＋同意連動（別途）。"
        action={
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg bg-accent px-3.5 py-2 font-ja text-[13px] font-bold text-on-accent">
            {open ? "閉じる" : "＋ 新規作成"}
          </button>
        }
      />

      {open && (
        <Card className="mb-4 p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="mb-2 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="本文"
            className="min-h-[90px] w-full rounded-lg border border-white/10 bg-surface px-3 py-2 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
          />
          <div className="mt-2 flex justify-end">
            <button onClick={submit} className="rounded-lg bg-accent px-4 py-2 font-ja text-[13px] font-bold text-on-accent">公開する</button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {announcements.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-ja text-[14px] font-bold text-ink">{a.title}</div>
              <StatusBadge status={a.status} />
            </div>
            <p className="mt-1 font-ja text-[12px] leading-relaxed text-ink-2">{a.body}</p>
            <div className="mt-2 font-ja text-[11px] text-faint">{a.publishedAt}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
