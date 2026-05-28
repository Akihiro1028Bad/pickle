"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/store";
import { PageHeader, Card, Badge, StatusBadge } from "@/components/ui";
import { AdminFormDialog, type AdminFormValues } from "@/components/AdminFormDialog";
import { ADMIN_ROLE_LABEL, type AdminRole, type AdminUser } from "@/lib/mock";

const ROLE_TONE: Record<AdminRole, "accent" | "info" | "neutral"> = {
  super_admin: "accent",
  moderator: "info",
  facility_staff: "info",
  viewer: "neutral",
};

function RoleBadge({ role }: { role: AdminRole }) {
  return <Badge tone={ROLE_TONE[role]}>{ADMIN_ROLE_LABEL[role]}</Badge>;
}

const fieldClass =
  "h-9 rounded-lg border border-white/10 bg-surface px-3 font-ja text-[13px] text-ink outline-none focus:border-accent/50";

type DialogState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; target: AdminUser };

export default function AdminsPage() {
  const { admins, currentAdmin, setCurrentAdmin, inviteAdmin, updateAdmin, toggleAdminStatus } =
    useAdmin();

  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const activeCount = admins.filter((a) => a.status === "active").length;
  const canManage = currentAdmin.role === "super_admin";

  const closeDialog = () => setDialog({ open: false });

  const handleSubmit = (values: AdminFormValues) => {
    if (!dialog.open) return;
    if (dialog.mode === "create") {
      inviteAdmin(values.name, values.email, values.role, values.password);
    } else {
      updateAdmin(dialog.target.id, {
        name: values.name,
        email: values.email,
        role: values.role,
        // 空欄ならパスワードは変更しない
        password: values.password ? values.password : undefined,
      });
    }
    closeDialog();
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="管理者"
        desc={`有効 ${activeCount} 名 / 全 ${admins.length} 名`}
        action={
          canManage && (
            <button
              onClick={() => setDialog({ open: true, mode: "create" })}
              className="h-9 rounded-lg bg-accent px-4 font-ja text-[13px] font-bold text-on-accent hover:opacity-90"
            >
              ＋ 管理者を招待
            </button>
          )
        }
      />

      {/* ログイン中の管理者切替（デモ用ロールトグル） */}
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-ja text-[11px] font-bold uppercase tracking-wider text-muted">
              ログイン中（デモ用に切替可能）
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-ja text-[14px] font-bold text-ink">{currentAdmin.name}</span>
              <RoleBadge role={currentAdmin.role} />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <span className="font-ja text-[12px] text-muted">表示ユーザー</span>
            <select
              value={currentAdmin.id}
              onChange={(e) => setCurrentAdmin(e.target.value)}
              className={fieldClass}
            >
              {admins
                .filter((a) => a.status === "active")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}（{ADMIN_ROLE_LABEL[a.role]}）
                  </option>
                ))}
            </select>
          </label>
        </div>
        {!canManage && (
          <p className="mt-3 font-ja text-[12px] text-[#fbbf24]">
            ※ 現在のロール「{ADMIN_ROLE_LABEL[currentAdmin.role]}」では管理者の招待・編集・無効化はできません（super_admin のみ）。
          </p>
        )}
      </Card>

      {/* 管理者一覧 */}
      <div className="flex flex-col gap-3">
        {admins.map((a) => {
          const isSelf = a.id === currentAdmin.id;
          return (
            <Card key={a.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-ja text-[14px] font-bold text-ink">{a.name}</span>
                    {isSelf && (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 font-ja text-[10px] font-bold text-muted">
                        あなた
                      </span>
                    )}
                    <RoleBadge role={a.role} />
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-1 font-ja text-[11px] text-muted">{a.email}</div>
                  <div className="mt-1 font-ja text-[11px] text-faint">
                    最終ログイン {a.lastLoginAt} · 追加 {a.createdAt} · パスワード発行 {a.passwordSetAt ?? "未設定"}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDialog({ open: true, mode: "edit", target: a })}
                      className="h-9 rounded-lg bg-surface-2 px-3 font-ja text-[12px] font-semibold text-ink-2 hover:text-ink"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => toggleAdminStatus(a.id)}
                      disabled={isSelf}
                      title={isSelf ? "自分自身は無効化できません" : undefined}
                      className={`h-9 rounded-lg px-3 font-ja text-[12px] font-semibold disabled:opacity-40 ${
                        a.status === "active"
                          ? "bg-ember/15 text-ember hover:bg-ember/25"
                          : "bg-[#4ade80]/15 text-[#4ade80] hover:bg-[#4ade80]/25"
                      }`}
                    >
                      {a.status === "active" ? "無効化" : "有効化"}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <AdminFormDialog
        open={dialog.open}
        mode={dialog.open ? dialog.mode : "create"}
        initial={
          dialog.open && dialog.mode === "edit"
            ? { name: dialog.target.name, email: dialog.target.email, role: dialog.target.role }
            : undefined
        }
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
