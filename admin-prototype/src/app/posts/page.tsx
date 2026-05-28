"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card, StatusBadge, Badge, PbtBadgeChips } from "@/components/ui";
import { Modal } from "@/components/Modal";
import type { PostStatus, AdminPost } from "@/lib/mock";

export default function PostsPage() {
  const { posts, members, currentAdmin, addOfficialPost, setPostStatus, togglePinned } = useAdmin();
  const canPost = currentAdmin.role === "super_admin" || currentAdmin.role === "moderator";
  const [compose, setCompose] = useState(false);
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  const submitOfficial = () => {
    if (!body.trim()) return;
    addOfficialPost(body.trim(), pinned);
    setBody("");
    setPinned(false);
    setCompose(false);
  };
  const badgesByAuthor = (authorId: string) => members.find((m) => m.id === authorId)?.pbtBadges;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<PostStatus | "all" | "official" | "pinned">("all");
  const rows = posts.filter((p) => {
    const matchQ = !q || `${p.body}${p.author}`.toLowerCase().includes(q.toLowerCase());
    const matchF =
      filter === "all" ||
      (filter === "official" ? p.official : filter === "pinned" ? p.pinned : p.status === filter);
    return matchQ && matchF;
  });
  const filters = [
    { key: "all" as const, label: "すべて" },
    { key: "open" as const, label: "公開中" },
    { key: "hidden" as const, label: "非表示" },
    { key: "closed" as const, label: "締切" },
    { key: "official" as const, label: "運営" },
    { key: "pinned" as const, label: "おすすめ" },
  ];

  return (
    <div>
      <PageHeader
        title="投稿管理"
        desc={`${posts.length} 件（掲示板の募集投稿）`}
        action={
          canPost && (
            <button
              onClick={() => setCompose(true)}
              className="h-9 shrink-0 rounded-lg bg-accent px-4 font-ja text-[13px] font-bold text-on-accent hover:opacity-90"
            >
              ＋ 公式投稿を作成
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="本文 / 投稿者で検索"
          className="h-9 w-full rounded-lg border border-white/10 bg-surface px-3 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50 sm:w-64"
        />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 font-ja text-[12px] font-semibold ${
              filter === f.key ? "bg-accent text-on-accent" : "bg-surface text-ink-2 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* PC: テーブル */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/8 font-ja text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-semibold">投稿</th>
              <th className="px-4 py-3 font-semibold">投稿者</th>
              <th className="px-4 py-3 font-semibold">状態</th>
              <th className="px-4 py-3 font-semibold">投稿日時</th>
              <th className="px-4 py-3 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                <td className="max-w-[360px] px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.pinned && <Badge tone="accent">★ おすすめ</Badge>}
                    {p.official && <Badge tone="info">運営</Badge>}
                  </div>
                  <div className="mt-1 line-clamp-2 font-ja text-[12px] text-ink-2">{p.body}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-ja text-[12px] text-ink">{p.author}</span>
                    <PbtBadgeChips badges={badgesByAuthor(p.authorId)} />
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 font-ja text-[12px] text-muted">{p.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <PostActions p={p} setPostStatus={setPostStatus} togglePinned={togglePinned} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-ja text-[13px] text-muted">該当する投稿がありません</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* モバイル: カード */}
      <div className="flex flex-col gap-3 lg:hidden">
        {rows.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {p.pinned && <Badge tone="accent">★ おすすめ</Badge>}
              {p.official && <Badge tone="info">運営</Badge>}
              <StatusBadge status={p.status} />
            </div>
            <p className="mt-2 line-clamp-3 font-ja text-[13px] text-ink-2">{p.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="font-ja text-[12px] text-ink">{p.author}</span>
              <PbtBadgeChips badges={badgesByAuthor(p.authorId)} />
              <span className="font-ja text-[11px] text-faint">· {p.createdAt}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <PostActions p={p} setPostStatus={setPostStatus} togglePinned={togglePinned} />
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="p-8 text-center font-ja text-[13px] text-muted">該当する投稿がありません</Card>
        )}
      </div>

      <Modal
        open={compose}
        onClose={() => setCompose(false)}
        title="公式投稿を作成"
        desc="PBT運営アカウントとして掲示板に投稿します"
        footer={
          <>
            <button
              onClick={() => setCompose(false)}
              className="h-9 rounded-lg bg-surface-2 px-4 font-ja text-[13px] font-semibold text-ink-2 hover:text-ink"
            >
              キャンセル
            </button>
            <button
              onClick={submitOfficial}
              disabled={!body.trim()}
              className="h-9 rounded-lg bg-accent px-4 font-ja text-[13px] font-bold text-on-accent hover:opacity-90 disabled:opacity-40"
            >
              公開する
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge tone="info">運営</Badge>
            <span className="font-ja text-[12px] text-muted">投稿者: PBT運営（公式）</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="例）平日昼の空きが狙い目です。初心者デー開催中、お気軽にどうぞ🎾"
            className="w-full resize-none rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 font-ja text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent/50"
          />
          <label className="flex items-center gap-2 font-ja text-[13px] text-ink-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            ピン留め（掲示板の最上部に固定）
          </label>
        </div>
      </Modal>
    </div>
  );
}

function PostActions({
  p,
  setPostStatus,
  togglePinned,
}: {
  p: AdminPost;
  setPostStatus: (id: string, status: PostStatus) => void;
  togglePinned: (id: string) => void;
}) {
  return (
    <>
      <button
        onClick={() => togglePinned(p.id)}
        className={`rounded-md px-2.5 py-1.5 font-ja text-[11px] font-bold ${
          p.pinned ? "bg-accent/15 text-accent hover:bg-accent/25" : "bg-surface-2 text-ink-2 hover:text-ink"
        }`}
      >
        {p.pinned ? "おすすめ解除" : "おすすめにする"}
      </button>
      {p.status !== "closed" && (
        <button
          onClick={() => setPostStatus(p.id, "closed")}
          className="rounded-md bg-surface-2 px-2.5 py-1.5 font-ja text-[11px] font-bold text-ink-2 hover:text-ink"
        >
          締切
        </button>
      )}
      {p.status === "hidden" ? (
        <button
          onClick={() => setPostStatus(p.id, "open")}
          className="rounded-md bg-[#4ade80]/15 px-2.5 py-1.5 font-ja text-[11px] font-bold text-[#4ade80] hover:bg-[#4ade80]/25"
        >
          公開に戻す
        </button>
      ) : (
        <button
          onClick={() => setPostStatus(p.id, "hidden")}
          className="rounded-md bg-ember/15 px-2.5 py-1.5 font-ja text-[11px] font-bold text-ember hover:bg-ember/25"
        >
          非表示
        </button>
      )}
    </>
  );
}
