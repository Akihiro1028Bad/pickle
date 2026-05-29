import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Post, Thread, Announcement, User } from "./types";
import { seedPosts, seedThreads, seedAnnouncements, DEMO_USER } from "./mockData";

let counter = 1000;
const nextId = (prefix: string) => `${prefix}${++counter}`;

interface AppContextValue {
  user: User;
  posts: Post[];
  threads: Thread[];
  announcements: Announcement[];
  unreadNewsCount: number;
  addPost: (body: string, duration?: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  markNewsRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(DEMO_USER);
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [threads, setThreads] = useState<Thread[]>(seedThreads);
  const [announcements] = useState<Announcement[]>(seedAnnouncements);
  const [readNewsIds, setReadNewsIds] = useState<string[]>([]);

  const unreadNewsCount = useMemo(
    () => announcements.filter((a) => !readNewsIds.includes(a.id)).length,
    [announcements, readNewsIds],
  );

  const markNewsRead = useCallback(() => {
    setReadNewsIds(seedAnnouncements.map((a) => a.id));
  }, []);

  const addPost = useCallback(
    (body: string, duration?: string) => {
      setPosts((prev) => [
        {
          id: nextId("p"),
          author: user.name,
          timeAgo: "たった今",
          body,
          self: true,
          level: user.level ? `${user.level}${user.dupr ? ` · DUPR ${user.dupr}` : ""}` : undefined,
          authorBadges: user.badges,
          duration: duration ?? "1日",
        },
        ...prev,
      ]);
    },
    [user],
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

  const markRead = useCallback((threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      posts,
      threads,
      announcements,
      unreadNewsCount,
      addPost,
      sendMessage,
      markRead,
      markNewsRead,
    }),
    [user, posts, threads, announcements, unreadNewsCount, addPost, sendMessage, markRead, markNewsRead],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
