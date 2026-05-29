// PBT world tokens（Webプロトタイプ globals.css と同一の値）
export const colors = {
  bg: "#0a0a1a",
  bgDeep: "#06060f",
  surface: "#14141f",
  surface2: "#1c1c2b",
  ink: "#ececec",
  ink2: "#bfbfc8",
  muted: "#8a8a8a",
  faint: "#54545f",
  court: "#171728",
  court2: "#24243c",
  accent: "#f6ff54",
  accentDeep: "#d4de2e",
  onAccent: "#0a0a1a",
  ember: "#ff6a3d",
  // 半透明ボーダー（rgba(255,255,255,0.08) 相当）
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
} as const;

export type AppColors = typeof colors;
