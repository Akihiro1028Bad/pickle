"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  seedMembers,
  seedPosts,
  seedReports,
  seedInquiries,
  seedAnnouncements,
  seedAudit,
  seedAdmins,
  ADMIN_ROLE_LABEL,
  initialFlags,
  initialLabolaUrl,
  type Member,
  type MemberStatus,
  type AdminPost,
  type PostStatus,
  type Report,
  type ReportStatus,
  type Inquiry,
  type InquiryStatus,
  type Announcement,
  type AuditEntry,
  type AdminUser,
  type AdminRole,
  type PbtBadge,
} from "./mock";

let w = 7000;
const wid = () => `w${++w}`;
let im = 8000;
const imid = () => `iqm${++im}`;

type Flags = typeof initialFlags;

interface AdminContextValue {
  members: Member[];
  posts: AdminPost[];
  reports: Report[];
  inquiries: Inquiry[];
  announcements: Announcement[];
  audit: AuditEntry[];
  flags: Flags;
  labolaUrl: string;
  // 管理者ユーザー管理
  admins: AdminUser[];
  /** ログイン中の管理者（ロール切替トグルで変更できるデモ用） */
  currentAdmin: AdminUser;
  setCurrentAdmin: (id: string) => void;
  inviteAdmin: (name: string, email: string, role: AdminRole, password: string) => void;
  updateAdmin: (
    id: string,
    patch: { name: string; email: string; role: AdminRole; password?: string },
  ) => void;
  setAdminRole: (id: string, role: AdminRole) => void;
  toggleAdminStatus: (id: string) => void;
  setMemberStatus: (id: string, status: MemberStatus) => void;
  setMemberMemo: (id: string, memo: string) => void;
  toggleMemberBadge: (id: string, badge: PbtBadge) => void;
  setMemberBadges: (id: string, badges: PbtBadge[]) => void;
  warnUser: (id: string, reason: string) => void;
  addOfficialPost: (body: string, pinned: boolean) => void;
  setPostStatus: (id: string, status: PostStatus) => void;
  togglePinned: (id: string) => void;
  setReportStatus: (id: string, status: ReportStatus, note?: string) => void;
  setInquiryStatus: (id: string, status: InquiryStatus) => void;
  replyInquiry: (id: string, text: string) => void;
  addAnnouncement: (title: string, body: string) => void;
  toggleFlag: (key: keyof Flags) => void;
  setLabolaUrl: (url: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

let c = 9000;
const nid = (p: string) => `${p}${++c}`;

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [posts, setPosts] = useState<AdminPost[]>(seedPosts);
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [inquiries, setInquiries] = useState<Inquiry[]>(seedInquiries);
  const [announcements, setAnnouncements] = useState<Announcement[]>(seedAnnouncements);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [flags, setFlags] = useState<Flags>(initialFlags);
  const [labolaUrl, setLabolaUrlState] = useState<string>(initialLabolaUrl);
  const [admins, setAdmins] = useState<AdminUser[]>(seedAdmins);
  const [currentAdminId, setCurrentAdminId] = useState<string>(seedAdmins[0].id);

  const currentAdmin = admins.find((a) => a.id === currentAdminId) ?? admins[0];

  // 監査ログの操作者は「ログイン中の管理者」を反映（依存配列を増やさず参照する）
  const actorRef = useRef(currentAdmin.email);
  actorRef.current = currentAdmin.email;

  const log = useCallback((action: string, target: string) => {
    setAudit((prev) => [{ id: nid("al"), actor: actorRef.current, action, target, at: "たった今" }, ...prev]);
  }, []);

  const setCurrentAdmin = useCallback((id: string) => {
    setCurrentAdminId(id);
  }, []);

  const inviteAdmin = useCallback(
    (name: string, email: string, role: AdminRole, password: string) => {
      const id = nid("ad");
      setAdmins((prev) => [
        {
          id,
          name,
          email,
          role,
          status: "active",
          lastLoginAt: "—（未ログイン）",
          createdAt: "たった今",
          // 平文は保持せず、発行日時のみ記録
          passwordSetAt: password ? "たった今" : undefined,
        },
        ...prev,
      ]);
      log(`管理者を招待（${ADMIN_ROLE_LABEL[role]}・初期パスワード発行）`, `admin:${email}`);
    },
    [log],
  );

  const updateAdmin = useCallback(
    (id: string, patch: { name: string; email: string; role: AdminRole; password?: string }) => {
      const { password, ...rest } = patch;
      const reissued = !!password;
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, ...rest, passwordSetAt: reissued ? "たった今" : a.passwordSetAt } : a,
        ),
      );
      log(
        `管理者情報を編集（${rest.name}・${ADMIN_ROLE_LABEL[rest.role]}${reissued ? "・パスワード再発行" : ""}）`,
        `admin:${id}`,
      );
    },
    [log],
  );

  const setAdminRole = useCallback(
    (id: string, role: AdminRole) => {
      setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)));
      log(`管理者ロールを変更→${ADMIN_ROLE_LABEL[role]}`, `admin:${id}`);
    },
    [log],
  );

  const toggleAdminStatus = useCallback(
    (id: string) => {
      const current = admins.find((a) => a.id === id);
      const next: AdminUser["status"] = current?.status === "active" ? "disabled" : "active";
      setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
      log(`管理者を${next === "disabled" ? "無効化" : "有効化"}`, `admin:${id}`);
    },
    [admins, log],
  );

  const setMemberStatus = useCallback(
    (id: string, status: MemberStatus) => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      const m = members.find((x) => x.id === id);
      log(`会員ステータス変更→${status}`, `user:${id}${m ? ` (${m.name})` : ""}`);
    },
    [members, log],
  );

  const setMemberMemo = useCallback((id: string, memo: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, memo } : m)));
  }, []);

  const toggleMemberBadge = useCallback(
    (id: string, badge: PbtBadge) => {
      let added = false;
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const current = m.pbtBadges ?? [];
          const has = current.includes(badge);
          added = !has;
          return { ...m, pbtBadges: has ? current.filter((b) => b !== badge) : [...current, badge] };
        }),
      );
      log(`PBTバッジ「${badge}」を${added ? "付与" : "解除"}`, `user:${id}`);
    },
    [log],
  );

  const setMemberBadges = useCallback(
    (id: string, badges: PbtBadge[]) => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, pbtBadges: badges } : m)));
      log(badges.length ? `PBTバッジを更新（${badges.join("・")}）` : "PBTバッジをすべて解除", `user:${id}`);
    },
    [log],
  );

  const warnUser = useCallback(
    (id: string, reason: string) => {
      let count = 0;
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const warnings = [{ id: wid(), reason, at: "たった今" }, ...(m.warnings ?? [])];
          count = warnings.length;
          return { ...m, warnings };
        }),
      );
      const m = members.find((x) => x.id === id);
      log(`運営警告を送信（${count}回目）`, `user:${id}${m ? ` (${m.name})` : ""}`);
    },
    [members, log],
  );

  const addOfficialPost = useCallback(
    (body: string, pinned: boolean) => {
      const id = nid("p");
      setPosts((prev) => [
        { id, authorId: "admin", author: "PBT運営", body, status: "open", pinned, official: true, createdAt: "たった今" },
        ...prev,
      ]);
      log(`公式投稿を作成${pinned ? "（ピン留め）" : ""}`, `post:${id}`);
    },
    [log],
  );

  const setPostStatus = useCallback(
    (id: string, status: PostStatus) => {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      log(`投稿を${status === "hidden" ? "非表示" : status === "closed" ? "クローズ" : "公開"}`, `post:${id}`);
    },
    [log],
  );

  const togglePinned = useCallback(
    (id: string) => {
      let added = false;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          added = !p.pinned;
          return { ...p, pinned: !p.pinned };
        }),
      );
      log(`投稿を${added ? "おすすめに設定" : "おすすめ解除"}`, `post:${id}`);
    },
    [log],
  );

  const setReportStatus = useCallback(
    (id: string, status: ReportStatus, note?: string) => {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      log(`通報を${status}${note ? `（${note}）` : ""}`, `report:${id}`);
    },
    [log],
  );

  const setInquiryStatus = useCallback(
    (id: string, status: InquiryStatus) => {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      log(`問い合わせを${status}`, `inquiry:${id}`);
    },
    [log],
  );

  const replyInquiry = useCallback(
    (id: string, text: string) => {
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                // 完了済みでなければ「対応中」に進める
                status: i.status === "done" ? i.status : "in_progress",
                messages: [...(i.messages ?? []), { id: imid(), from: "admin", text, at: "たった今" }],
              }
            : i,
        ),
      );
      log("問い合わせに返信", `inquiry:${id}`);
    },
    [log],
  );

  const addAnnouncement = useCallback(
    (title: string, body: string) => {
      const id = nid("a");
      setAnnouncements((prev) => [
        { id, title, body, status: "published", publishedAt: "たった今" },
        ...prev,
      ]);
      log("お知らせを公開", `announcement:${id}`);
    },
    [log],
  );

  const toggleFlag = useCallback(
    (key: keyof Flags) => {
      setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
      log("設定フラグ切替", `flag:${key}`);
    },
    [log],
  );

  const setLabolaUrl = useCallback(
    (url: string) => {
      setLabolaUrlState(url);
      log("LaBOLA予約URLを更新", "config:labolaUrl");
    },
    [log],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      members,
      posts,
      reports,
      inquiries,
      announcements,
      audit,
      flags,
      labolaUrl,
      admins,
      currentAdmin,
      setCurrentAdmin,
      inviteAdmin,
      updateAdmin,
      setAdminRole,
      toggleAdminStatus,
      setMemberStatus,
      setMemberMemo,
      toggleMemberBadge,
      setMemberBadges,
      warnUser,
      addOfficialPost,
      setPostStatus,
      togglePinned,
      setReportStatus,
      setInquiryStatus,
      replyInquiry,
      addAnnouncement,
      toggleFlag,
      setLabolaUrl,
    }),
    [members, posts, reports, inquiries, announcements, audit, flags, labolaUrl, admins, currentAdmin, setCurrentAdmin, inviteAdmin, updateAdmin, setAdminRole, toggleAdminStatus, setMemberStatus, setMemberMemo, toggleMemberBadge, setMemberBadges, warnUser, addOfficialPost, setPostStatus, togglePinned, setReportStatus, setInquiryStatus, replyInquiry, addAnnouncement, toggleFlag, setLabolaUrl],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
