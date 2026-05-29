import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";
import type { PbtBadge } from "@/lib/types";

const PBT_STYLE: Record<PbtBadge, { border: string; bg: string; fg: string }> = {
  認定: { border: "rgba(246,255,84,0.4)", bg: "rgba(246,255,84,0.15)", fg: colors.accent },
  スタッフ: { border: "rgba(48,110,195,0.45)", bg: "rgba(48,110,195,0.2)", fg: "#7fb0ff" },
  認定コーチ: { border: "rgba(48,110,195,0.45)", bg: "rgba(48,110,195,0.2)", fg: "#7fb0ff" },
  契約選手: { border: "rgba(255,106,61,0.4)", bg: "rgba(255,106,61,0.15)", fg: colors.ember },
};

export function PbtBadges({ badges }: { badges?: PbtBadge[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <View style={styles.row}>
      {badges.map((b) => {
        const s = PBT_STYLE[b];
        return (
          <View key={b} style={[styles.chip, { borderColor: s.border, backgroundColor: s.bg }]}>
            <Text style={[styles.chipTxt, { color: s.fg }]}>✓ PBT{b}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** 公式 / おすすめ の強調ラベル（アクセント背景） */
export function AccentTag({ label }: { label: string }) {
  return (
    <View style={styles.accentTag}>
      <Text style={styles.accentTagTxt}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 4, alignItems: "center" },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipTxt: { fontSize: 10, fontWeight: "700", lineHeight: 14 },
  accentTag: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  accentTagTxt: {
    color: colors.onAccent,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
