import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";

const DURATIONS = ["3時間", "1日", "3日", "7日"];

export default function ComposeScreen() {
  const router = useRouter();
  const { addPost } = useApp();
  const [body, setBody] = useState("");
  const [duration, setDuration] = useState("1日");

  const onSubmit = () => {
    if (!body.trim()) return;
    addPost(body.trim(), duration);
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>キャンセル</Text>
        </Pressable>
        <Text style={styles.title}>募集を投稿</Text>
        <Pressable onPress={onSubmit} disabled={!body.trim()}>
          <Text style={[styles.post, !body.trim() && { opacity: 0.4 }]}>投稿</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.body}>
          <TextInput
            style={styles.input}
            value={body}
            onChangeText={setBody}
            placeholder="例）今日 19:00〜 PBTコート2 中級ダブルス、あと1名募集！手ぶらOK🥒"
            placeholderTextColor={colors.faint}
            multiline
            autoFocus
          />

          <Text style={styles.label}>表示する期間</Text>
          <View style={styles.chipRow}>
            {DURATIONS.map((d) => {
              const active = d === duration;
              return (
                <Pressable key={d} onPress={() => setDuration(d)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  cancel: { color: colors.muted, fontSize: 14 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  post: { color: colors.accent, fontSize: 14, fontWeight: "800" },
  body: { padding: 20, flex: 1 },
  input: { minHeight: 140, color: colors.ink, fontSize: 15, lineHeight: 22, textAlignVertical: "top" },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  chipTxt: { color: colors.ink2, fontSize: 12, fontWeight: "700" },
  chipTxtActive: { color: colors.onAccent },
});
