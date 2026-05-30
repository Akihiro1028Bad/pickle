import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";
import { REGION_GROUPS } from "@/lib/regions";

interface RegionChipsProps {
  value: string[];
  onChange: (next: string[]) => void;
}

/** 地方ごとにグルーピングした地域の複数選択チップ。投稿作成・一覧フィルタで共用。 */
export function RegionChips({ value, onChange }: RegionChipsProps) {
  const toggle = (r: string) =>
    onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);

  return (
    <View style={{ gap: 10 }}>
      {REGION_GROUPS.map((group) => (
        <View key={group.label}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          <View style={styles.row}>
            {group.regions.map((r) => {
              const on = value.includes(r);
              return (
                <Pressable key={r} onPress={() => toggle(r)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { color: colors.faint, fontSize: 10, fontWeight: "700", marginBottom: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  chipTxt: { color: colors.ink2, fontSize: 12, fontWeight: "700" },
  chipTxtOn: { color: colors.onAccent },
});
