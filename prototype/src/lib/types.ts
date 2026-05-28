/** PBT が付与する公式バッジ（"PBT" + ラベルで表示） */
export type PbtBadge = "認定" | "スタッフ" | "認定コーチ" | "契約選手";

export interface Post {
  id: string;
  author: string;
  timeAgo: string;
  body: string;
  level?: string;
  self?: boolean;
  /** 投稿者のPBTバッジ（複数可） */
  authorBadges?: PbtBadge[];
  /** 管理画面で「おすすめ」設定された投稿（ホーム上部に表示） */
  featured?: boolean;
  /** PBT運営アカウントによる公式投稿（公式バッジ＋強調表示） */
  official?: boolean;
  /** 表示時間（作成時に選択。プロトタイプは表示のみ） */
  duration?: string;
}

/** 運営からのお知らせ（管理画面で公開された内容をアプリ側に表示） */
export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** 表示用の日付（例: 2026-05-26） */
  publishedAt: string;
  /** 重要なお知らせ（一覧で強調・ホームのバナー表示対象） */
  important?: boolean;
}

export interface Message {
  id: string;
  fromSelf: boolean;
  text: string;
  time: string;
}

export interface Thread {
  id: string;
  name: string;
  meta?: string;
  preview: string;
  time: string;
  unread?: number;
  messages: Message[];
  /** 運営サポート窓口（メッセージ一覧の最上部に固定・公式バッジ表示） */
  official?: boolean;
}
