export type MemberStatus = "guest" | "member" | "suspended" | "banned" | "withdrawn";
export type PostStatus = "open" | "closed" | "hidden";
export type ReportStatus = "open" | "in_progress" | "resolved" | "rejected";
export type InquiryStatus = "open" | "in_progress" | "done";
/** 管理者（運営スタッフ）のロール。RBAC: 仕様 admin-spec.md §1 */
export type AdminRole = "super_admin" | "moderator" | "facility_staff" | "viewer";
export type AdminUserStatus = "active" | "disabled";
export const ADMIN_ROLES: AdminRole[] = ["super_admin", "moderator", "facility_staff", "viewer"];
export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "管理者（全権）",
  moderator: "モデレーター",
  facility_staff: "施設スタッフ",
  viewer: "閲覧のみ",
};
export const ADMIN_ROLE_DESC: Record<AdminRole, string> = {
  super_admin: "全操作が可能。管理者の招待・ロール変更もできる。",
  moderator: "通報対応・投稿/会員のモデレーション。",
  facility_staff: "コート・お知らせなど施設運用の操作。",
  viewer: "閲覧のみ。BAN・削除などの操作は不可。",
};
/** PBTが付与する公式バッジ（"PBT" + ラベルで表示・複数可） */
export type PbtBadge = "認定" | "スタッフ" | "認定コーチ" | "契約選手";
export const PBT_BADGES: PbtBadge[] = ["認定", "スタッフ", "認定コーチ", "契約選手"];

/** 運営からの警告履歴（イエローカード） */
export interface WarningEntry {
  id: string;
  reason: string;
  at: string;
}

export interface Member {
  id: string;
  name: string;
  handle: string;
  email: string;
  status: MemberStatus;
  level: string;
  dupr?: string;
  provider: "google" | "apple" | "email";
  joinedAt: string;
  lastActiveAt: string;
  memo?: string;
  /** PBT公式バッジ（複数付与可） */
  pbtBadges?: PbtBadge[];
  /** 運営からの警告履歴（新しい順） */
  warnings?: WarningEntry[];
}

export interface AdminPost {
  id: string;
  authorId: string;
  author: string;
  body: string;
  status: PostStatus;
  pinned: boolean;
  official: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  targetType: "post" | "dm" | "user" | "profile";
  targetSummary: string;
  reason: string;
  reporter: string;
  status: ReportStatus;
  severity: "low" | "medium" | "high";
  createdAt: string;
  ageHours: number;
}

export interface InquiryMessage {
  id: string;
  from: "user" | "admin";
  text: string;
  at: string;
}

export interface Inquiry {
  id: string;
  user: string;
  subject: string;
  body: string;
  status: InquiryStatus;
  createdAt: string;
  /** 会話履歴（最初の1件はユーザーの問い合わせ本文） */
  messages?: InquiryMessage[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: "published" | "draft";
  publishedAt: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

/** 管理画面にログインする運営スタッフ。アプリ会員(Member)とは別管理 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastLoginAt: string;
  createdAt: string;
  /** 最終パスワード発行日時（平文は保持しない）。未設定は undefined */
  passwordSetAt?: string;
}

export const seedAdmins: AdminUser[] = [
  { id: "ad1", name: "運営 太郎", email: "taro@pbt.jp", role: "super_admin", status: "active", lastLoginAt: "たった今", createdAt: "2026-03-01", passwordSetAt: "2026-03-01" },
  { id: "ad2", name: "佐藤 もえ", email: "moe@pbt.jp", role: "moderator", status: "active", lastLoginAt: "1時間前", createdAt: "2026-03-15", passwordSetAt: "2026-03-15" },
  { id: "ad3", name: "コート 花子", email: "hanako@court.jp", role: "facility_staff", status: "active", lastLoginAt: "昨日", createdAt: "2026-04-02", passwordSetAt: "2026-04-02" },
  { id: "ad4", name: "委託 ビューア", email: "viewer@partner.jp", role: "viewer", status: "active", lastLoginAt: "3日前", createdAt: "2026-04-20", passwordSetAt: "2026-04-20" },
  { id: "ad5", name: "退任 元担当", email: "old@pbt.jp", role: "moderator", status: "disabled", lastLoginAt: "1ヶ月前", createdAt: "2026-02-10", passwordSetAt: "2026-02-10" },
];

export const kpis = {
  dau: 128,
  signups: 14,
  posts: 37,
  reports: 3,
  series: [82, 96, 110, 104, 121, 118, 128], // 直近7日 DAU
};

export const seedMembers: Member[] = [
  { id: "u1", name: "西村さん", handle: "@nishimura", email: "nishimura@example.com", status: "member", level: "中級", dupr: "3.45", provider: "google", joinedAt: "2026-03-12", lastActiveAt: "2時間前", memo: "主催多め。常連。", pbtBadges: ["認定"] },
  { id: "u2", name: "TAKA", handle: "@taka", email: "taka@example.com", status: "member", level: "上級", dupr: "4.1", provider: "apple", joinedAt: "2026-03-20", lastActiveAt: "4時間前", pbtBadges: ["契約選手"] },
  { id: "u3", name: "さくら", handle: "@sakura", email: "sakura@example.com", status: "member", level: "初級", provider: "google", joinedAt: "2026-04-02", lastActiveAt: "昨日", pbtBadges: ["スタッフ"] },
  { id: "u4", name: "Kenji", handle: "@kenji", email: "kenji@example.com", status: "member", level: "中級", dupr: "3.6", provider: "email", joinedAt: "2026-04-08", lastActiveAt: "昨日", pbtBadges: ["認定コーチ"] },
  { id: "u5", name: "Mai", handle: "@mai", email: "mai@example.com", status: "member", level: "中級", provider: "google", joinedAt: "2026-04-15", lastActiveAt: "3日前" },
  { id: "u6", name: "Daiki", handle: "@daiki", email: "daiki@example.com", status: "suspended", level: "上級", dupr: "3.9", provider: "google", joinedAt: "2026-04-18", lastActiveAt: "5日前", memo: "スパム投稿で一時停止（〜5/30）", warnings: [{ id: "w1", reason: "スパム・宣伝／外部サービスへの誘導", at: "6日前" }] },
  { id: "u7", name: "ゆうこ", handle: "@yuko", email: "yuko@example.com", status: "member", level: "初級", provider: "apple", joinedAt: "2026-05-01", lastActiveAt: "1時間前" },
  { id: "u8", name: "Ren", handle: "@ren", email: "ren@example.com", status: "member", level: "中級", dupr: "3.5", provider: "google", joinedAt: "2026-05-03", lastActiveAt: "昨日" },
  { id: "u9", name: "あさみ", handle: "@asami", email: "asami@example.com", status: "member", level: "中級", provider: "email", joinedAt: "2026-05-10", lastActiveAt: "2日前" },
  { id: "u10", name: "Sho", handle: "@sho", email: "sho@example.com", status: "banned", level: "上級", dupr: "4.3", provider: "google", joinedAt: "2026-05-12", lastActiveAt: "1週間前", memo: "悪質な勧誘でBAN。" },
  { id: "u11", name: "ゲスト太郎", handle: "@guest_t", email: "—", status: "guest", level: "—", provider: "email", joinedAt: "—", lastActiveAt: "30分前" },
];

export const seedPosts: AdminPost[] = [
  { id: "p1", authorId: "u1", author: "西村さん", body: "今日 19:00〜21:00 / PBT コート2 中級ダブルス、あと1名募集！¥1,200/人・手ぶらOK🥒", status: "open", pinned: true, official: false, createdAt: "2時間前" },
  { id: "p2", authorId: "u2", author: "TAKA", body: "明日 21:30〜 上級ラリーしたい人募集。DUPR 4.0+ でがっつり2時間、コート代割り勘で🔥", status: "open", pinned: false, official: false, createdAt: "4時間前" },
  { id: "p3", authorId: "u3", author: "さくら", body: "今週末の朝活メンバー募集中☀️ 初心者歓迎、ゆるく楽しくやりましょう。時間は相談で！", status: "open", pinned: false, official: false, createdAt: "5時間前" },
  { id: "p4", authorId: "admin", author: "PBT運営", body: "【運営】平日昼の空きが狙い目です。初心者デー開催中、お気軽にどうぞ🎾", status: "open", pinned: false, official: true, createdAt: "6時間前" },
  { id: "p5", authorId: "u6", author: "Daiki", body: "パドル買いませんか？連絡はこちらまで→ LINE: xxxxx（※連絡先直書き・要確認）", status: "hidden", pinned: false, official: false, createdAt: "1日前" },
  { id: "p6", authorId: "u8", author: "Ren", body: "日曜 15:00〜17:00 4人ゲーム。あと2名募集、パドルレンタルあり手ぶらOK。", status: "closed", pinned: false, official: false, createdAt: "2日前" },
];

export const seedReports: Report[] = [
  { id: "r1", targetType: "post", targetSummary: "「パドル買いませんか？連絡は LINE: xxxxx」", reason: "プラットフォーム外誘導・宣伝", reporter: "さくら", status: "open", severity: "high", createdAt: "1時間前", ageHours: 1 },
  { id: "r2", targetType: "dm", targetSummary: "DMスレッド（Sho → ゆうこ）", reason: "ハラスメント・しつこい連絡", reporter: "ゆうこ", status: "in_progress", severity: "high", createdAt: "5時間前", ageHours: 5 },
  { id: "r3", targetType: "profile", targetSummary: "プロフィール「自称DUPR 5.0」", reason: "なりすまし・虚偽情報", reporter: "TAKA", status: "open", severity: "low", createdAt: "昨日", ageHours: 20 },
];

export const seedInquiries: Inquiry[] = [
  {
    id: "iq1",
    user: "ゆうこ",
    subject: "DMがブロックできない",
    body: "特定の相手をブロックしたいのですが方法が分かりません。",
    status: "open",
    createdAt: "2時間前",
    messages: [{ id: "iq1m1", from: "user", text: "特定の相手をブロックしたいのですが方法が分かりません。", at: "2時間前" }],
  },
  {
    id: "iq2",
    user: "Kenji",
    subject: "DUPRの反映について",
    body: "DUPRを更新したのですがアプリに反映されません。",
    status: "in_progress",
    createdAt: "昨日",
    messages: [
      { id: "iq2m1", from: "user", text: "DUPRを更新したのですがアプリに反映されません。", at: "昨日" },
      { id: "iq2m2", from: "admin", text: "ご連絡ありがとうございます。反映には最大24時間かかる場合があります。明日まで様子を見ていただけますか？", at: "昨日" },
    ],
  },
  {
    id: "iq3",
    user: "Mai",
    subject: "退会したい",
    body: "アカウントを削除したいです。データも消えますか？",
    status: "done",
    createdAt: "3日前",
    messages: [
      { id: "iq3m1", from: "user", text: "アカウントを削除したいです。データも消えますか？", at: "3日前" },
      { id: "iq3m2", from: "admin", text: "退会手続きを承りました。投稿・DMを含むデータは削除されます。お手続きが完了しましたのでご確認ください。", at: "3日前" },
    ],
  },
];

export const seedAnnouncements: Announcement[] = [
  { id: "a1", title: "5/29(金) 設備メンテナンスのお知らせ", body: "深夜2:00〜4:00の間、一時的に投稿・DMがご利用いただけません。", status: "published", publishedAt: "2026-05-26" },
  { id: "a2", title: "初心者デー開催中🎾", body: "平日昼は初心者歓迎の時間帯です。お気軽にご参加ください。", status: "published", publishedAt: "2026-05-20" },
  { id: "a3", title: "利用規約 改定（v1.1）", body: "禁止事項に「プラットフォーム外への勧誘」を追記しました。", status: "draft", publishedAt: "—" },
];

export const seedAudit: AuditEntry[] = [
  { id: "al1", actor: "admin@pbt", action: "投稿を非表示", target: "post:p5", at: "1日前" },
  { id: "al2", actor: "admin@pbt", action: "ユーザーをBAN", target: "user:u10 (Sho)", at: "1週間前" },
  { id: "al3", actor: "admin@pbt", action: "ユーザーを一時停止", target: "user:u6 (Daiki)", at: "5日前" },
];

export const initialFlags = {
  maintenance: false,
  board: true,
  dm: true,
  court: true,
};

export const initialLabolaUrl = "https://labola.jp/r/ （PBTの予約ページURL未設定）";
