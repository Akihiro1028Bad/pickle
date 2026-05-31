import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";
import { ALL_REGIONS, regionLabel } from "@/lib/regions";

interface RegionSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

/** 複数選択できる地域プルダウン（トリガー→シートのチェック式・フラット一覧）。投稿作成・一覧フィルタで共用。 */
export function RegionSelect({ value, onChange, placeholder = "地域を選択" }: RegionSelectProps) {
  const [open, setOpen] = useState(false);
  const toggle = (r: string) =>
    onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);
  const hasValue = value.length > 0;

  return (
    <>
      <Pressable style={[styles.trigger, hasValue && styles.triggerOn]} onPress={() => setOpen(true)}>
        <Text style={[styles.triggerTxt, hasValue && { color: colors.ink }]} numberOfLines={1}>
          📍 {hasValue ? regionLabel(value) : placeholder}
        </Text>
        <Text style={styles.caret}>▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.fill}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.grab} />
            <View style={styles.head}>
              <Text style={styles.title}>地域を選択（複数可）</Text>
              {hasValue && (
                <Pressable onPress={() => onChange([])}>
                  <Text style={styles.clear}>クリア</Text>
                </Pressable>
              )}
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {ALL_REGIONS.map((r) => {
                const on = value.includes(r);
                return (
                  <Pressable key={r} onPress={() => toggle(r)} style={styles.row}>
                    <View style={[styles.box, on && styles.boxOn]}>
                      {on && <Text style={styles.check}>✓</Text>}
                    </View>
                    <Text style={[styles.rowTxt, on && { color: colors.ink }]}>{r}</Text>
                  </Pressable>
                );
              })}
              <View style={{ height: 8 }} />
            </ScrollView>
            <Pressable style={styles.apply} onPress={() => setOpen(false)}>
              <Text style={styles.applyTxt}>適用</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerOn: { borderColor: "rgba(246,255,84,0.5)" },
  triggerTxt: { flex: 1, color: colors.ink2, fontSize: 13, fontWeight: "700" },
  caret: { color: colors.muted, fontSize: 10 },
  fill: { flex: 1, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    maxHeight: "85%",
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  grab: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  clear: { color: colors.muted, fontSize: 11, fontWeight: "700", textDecorationLine: "underline" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  box: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  boxOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  check: { color: colors.onAccent, fontSize: 12, fontWeight: "800" },
  rowTxt: { color: colors.ink2, fontSize: 14 },
  apply: { marginTop: 12, height: 46, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  applyTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
});
