import { useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";
import { RegionSelect } from "@/components/RegionSelect";

const PLACEHOLDER = "今日 19:00〜21:00 / 本八幡のPBT\n中級くらいで1名募集！\n手ぶらOK・料金は現地で割り勘";
const DURATIONS = ["3時間", "5時間", "1日", "3日"];
const MAX = 300;

export default function ComposeScreen() {
  const router = useRouter();
  const { addPost } = useApp();
  const [text, setText] = useState("");
  const [duration, setDuration] = useState("1日");
  const [regions, setRegions] = useState<string[]>([]);

  const onSubmit = () => {
    const body = text.trim();
    if (body) addPost(body, duration, regions);
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Text style={styles.iconTxt}>×</Text>
        </Pressable>
        <Text style={styles.title}>投稿を作成</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>投稿内容</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={(t) => setText(t.slice(0, MAX))}
            placeholder={PLACEHOLDER}
            placeholderTextColor={colors.faint}
            multiline
          />
          <Text style={styles.counter}>{text.length} / {MAX}</Text>
          <Text style={styles.helper}>
            料金・持ち物・雰囲気など、選択項目で伝えきれないことを<Text style={{ color: colors.accent, fontWeight: "700" }}>自由に</Text>書いてください。
          </Text>

          <Text style={[styles.label, { marginTop: 24 }]}>表示時間</Text>
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
          <Text style={styles.helper}>
            選んだ時間が過ぎると自然に下がっていく目安です（手動の締め切り操作は不要）。
          </Text>

          <Text style={[styles.label, { marginTop: 24 }]}>発信する地域（複数選択可）</Text>
          <Text style={[styles.helper, { marginTop: 0, marginBottom: 10 }]}>
            全国向けにもできますが、相手が見つかりやすいようにプレー予定の地域を選んでください。
          </Text>
          <RegionSelect value={regions} onChange={setRegions} placeholder="地域を選択（複数可）" />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.submit} onPress={onSubmit}>
            <Text style={styles.submitTxt}>投稿する</Text>
            <View style={styles.arrow}>
              <Text style={styles.arrowTxt}>→</Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  iconTxt: { color: colors.ink, fontSize: 18 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  body: { padding: 20 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },
  input: { minHeight: 220, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, padding: 14, color: colors.ink, fontSize: 13, lineHeight: 24, textAlignVertical: "top" },
  counter: { textAlign: "right", color: colors.faint, fontSize: 11, marginTop: 4 },
  helper: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  chipTxt: { color: colors.ink2, fontSize: 12, fontWeight: "700" },
  chipTxtActive: { color: colors.onAccent },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  submit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 8, backgroundColor: colors.accent },
  submitTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
  arrow: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.onAccent, alignItems: "center", justifyContent: "center" },
  arrowTxt: { color: colors.accent, fontSize: 13 },
});
