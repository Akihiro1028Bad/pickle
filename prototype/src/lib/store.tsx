"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Post, Thread, PbtBadge, Announcement } from "./types";
import { seedPosts, seedThreads, seedAnnouncements } from "./mockData";

export interface User {
  name: string;
  handle: string;
  email?: string;
  level?: string;
  dupr?: string;
  bio?: string;
  avatarUrl?: string;
  /** よく打つエリア（自由入力） */
  area?: string;
  /** よく空いている時間（チップ複数選択） */
  availability?: string[];
  /** PBT公式バッジ（管理画面で付与・複数可） */
  badges?: PbtBadge[];
  provider?: "google" | "email";
  profileComplete?: boolean;
}

const AUTH_KEY = "pbt_auth_user";
const NEWS_READ_KEY = "pbt_news_read";

interface AppContextValue {
  // auth
  user: User | null;
  authReady: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (data: { email: string }) => void;
  signup: (data: { name: string; email: string }) => void;
  updateProfile: (patch: Partial<User>) => void;
  logout: () => void;
  // data
  posts: Post[];
  threads: Thread[];
  addPost: (body: string, duration?: string) => void;
  ensureThreadForAuthor: (name: string, meta?: string) => string;
  sendMessage: (threadId: string, text: string) => void;
  receiveMessage: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  // 運営からのお知らせ
  announcements: Announcement[];
  unreadNewsCount: number;
  markNewsRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let counter = 1000;
const nextId = (prefix: string) => `${prefix}${++counter}`;

const GOOGLE_USER: User = {
  name: "Akihiro T.",
  handle: "@akihiro",
  email: "akihiro@gmail.com",
  provider: "google",
  profileComplete: false,
};

// メールでログインした「既存ユーザー」想定（プロフィール設定済み）
const RETURNING_EMAIL_USER: User = {
  name: "Akihiro T.",
  handle: "@akihiro",
  email: "akihiro@example.com",
  provider: "email",
  profileComplete: true,
};

// デモ用の初期ログインユーザー（保存ユーザーが無いときに自動ログイン）。
// Web を開いた瞬間からフル機能を見せるための既定アカウント。
const DEMO_USER: User = {
  name: "Akihiro T.",
  handle: "@akihiro",
  email: "akihiro@example.com",
  level: "中級",
  dupr: "3.6",
  area: "都内・PBTコート周辺",
  availability: ["平日夜", "土日午前"],
  badges: ["認定"],
  provider: "google",
  profileComplete: true,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [threads, setThreads] = useState<Thread[]>(seedThreads);
  const [announcements] = useState<Announcement[]>(seedAnnouncements);
  const [readNewsIds, setReadNewsIds] = useState<string[]>([]);

  // hydrate auth + 既読お知らせ from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      // 保存ユーザーがあればそれを優先。無ければデモユーザーで自動ログイン
      // （＝デフォルトでログイン済み。ログアウトしてもリロードで再ログイン）
      setUser(raw ? (JSON.parse(raw) as User) : DEMO_USER);
      const readRaw = localStorage.getItem(NEWS_READ_KEY);
      if (readRaw) setReadNewsIds(JSON.parse(readRaw) as string[]);
    } catch {
      setUser(DEMO_USER);
    }
    setAuthReady(true);
  }, []);

  const unreadNewsCount = useMemo(
    () => announcements.filter((a) => !readNewsIds.includes(a.id)).length,
    [announcements, readNewsIds],
  );

  const markNewsRead = useCallback(() => {
    const ids = seedAnnouncements.map((a) => a.id);
    setReadNewsIds(ids);
    try {
      localStorage.setItem(NEWS_READ_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
      else localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const loginWithGoogle = useCallback(() => persist(GOOGLE_USER), [persist]);

  const loginWithEmail = useCallback(
    (data: { email: string }) =>
      persist({
        ...RETURNING_EMAIL_USER,
        email: data.email || RETURNING_EMAIL_USER.email,
        handle: "@" + (data.email.split("@")[0] || "akihiro"),
      }),
    [persist],
  );

  const signup = useCallback(
    (data: { name: string; email: string }) =>
      persist({
        name: data.name || "あなた",
        handle: "@" + (data.email.split("@")[0] || "you"),
        email: data.email,
        provider: "email",
        profileComplete: false,
      }),
    [persist],
  );

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      const base: User = prev ?? { name: "あなた", handle: "@you", provider: "email" };
      const next = { ...base, ...patch };
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const logout = useCallback(() => persist(null), [persist]);

  const addPost = useCallback(
    (body: string, duration?: string) => {
      const author = user?.name ?? "あなた";
      setPosts((prev) => [
        {
          id: nextId("p"),
          author,
          timeAgo: "たった今",
          body,
          self: true,
          level: user?.level ? `${user.level}${user.dupr ? ` · DUPR ${user.dupr}` : ""}` : undefined,
          authorBadges: user?.badges,
          duration: duration ?? "1日",
        },
        ...prev,
      ]);
    },
    [user],
  );

  const ensureThreadForAuthor = useCallback(
    (name: string, meta?: string) => {
      const existing = threads.find((t) => t.name === name);
      if (existing) return existing.id;
      const id = nextId("t");
      setThreads((prev) => [
        { id, name, meta, preview: "（まだメッセージはありません）", time: "たった今", unread: 0, messages: [] },
        ...prev,
      ]);
      return id;
    },
    [threads],
  );

  const sendMessage = useCallback((threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              preview: text,
              time: "たった今",
              messages: [...t.messages, { id: nextId("m"), fromSelf: true, text, time: "今" }],
            }
          : t,
      ),
    );
  }, []);

  const receiveMessage = useCallback((threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              preview: text,
              time: "たった今",
              messages: [...t.messages, { id: nextId("m"), fromSelf: false, text, time: "今" }],
            }
          : t,
      ),
    );
  }, []);

  const markRead = useCallback((threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      authReady,
      loginWithGoogle,
      loginWithEmail,
      signup,
      updateProfile,
      logout,
      posts,
      threads,
      addPost,
      ensureThreadForAuthor,
      sendMessage,
      receiveMessage,
      markRead,
      announcements,
      unreadNewsCount,
      markNewsRead,
    }),
    [user, authReady, loginWithGoogle, loginWithEmail, signup, updateProfile, logout, posts, threads, addPost, ensureThreadForAuthor, sendMessage, receiveMessage, markRead, announcements, unreadNewsCount, markNewsRead],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
