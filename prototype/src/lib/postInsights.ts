import type { Post } from "./types";

const DATE_PATTERNS = ["今日", "明日", "週末", "土曜", "日曜", "平日", "金曜", "水曜"];
const LEVEL_PATTERNS = ["初心者", "初級", "初中級", "中級", "上級", "DUPR"];

export function getPostInsights(post: Pick<Post, "body" | "level">) {
  const body = post.body;
  const date = DATE_PATTERNS.find((word) => body.includes(word));
  const time = body.match(/\d{1,2}[:：]\d{2}/)?.[0] ?? body.match(/\d{1,2}時/)?.[0];
  const court = body.match(/PBT\s*コート\s*\d/i)?.[0] ?? (body.includes("PBT") ? "PBT" : undefined);
  const people = body.match(/あと\s*\d+\s*名/)?.[0] ?? body.match(/\d+\s*名募集/)?.[0];
  const level = LEVEL_PATTERNS.find((word) => body.includes(word)) ?? post.level?.split("·")[0].trim();

  return [
    date && time ? `${date} ${time}` : date ?? time,
    court,
    people,
    level,
  ].filter(Boolean) as string[];
}

export function getPostTone(post: Pick<Post, "body" | "level">) {
  const body = post.body;
  if (body.includes("初心者") || body.includes("初級") || body.includes("歓迎")) return "参加しやすい募集";
  if (body.includes("上級") || body.includes("DUPR 4")) return "しっかり打ちたい人向け";
  if (body.includes("朝") || body.includes("朝活")) return "朝の募集";
  return "募集中";
}
