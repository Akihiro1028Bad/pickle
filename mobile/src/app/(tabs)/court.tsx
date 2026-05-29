import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

const LABOLA_URL = "https://labola.jp/r/";
const COURTS = ["C1", "C2", "C3"];
const TIMES = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const DATES = [
  { n: "27", d: "今日" },
  { n: "28", d: "水" },
  { n: "29", d: "木" },
  { n: "30", d: "金" },
  { n: "31", d: "土" },
];

export default function CourtScreen() {
  const router = useRouter();
  const [day, setDay] = useState(0);
  const isFree = (ti: number, ci: number) => (ti + ci + day) % 3 !== 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>PBT コート空き状況</Text>
        <View style={styles.officialTag}>
          <Text style={styles.officialTxt}>OFFICIAL</Text>
        </View>
      </View>

      {/* 日付タブ */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow} contentContainerStyle={styles.dateRowInner}>
        {DATES.map((dt, i) => {
          const active = i === day;
          return (
            <Pressable key={dt.n} onPress={() => setDay(i)} style={[styles.dateCell, active && styles.dateCellActive]}>
              <Text style={[styles.dateNum, active && styles.dateNumActive]}>{dt.n}</Text>
              <Text style={[styles.dateDow, active && styles.dateDowActive]}>{dt.d}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* グリッド見出し */}
        <View style={styles.gridRow}>
          <View style={styles.timeCol} />
          {COURTS.map((c) => (
            <View key={c} style={styles.courtHead}>
              <Text style={styles.courtHeadTxt}>{c}</Text>
            </View>
          ))}
        </View>

        {TIMES.map((t, ti) => (
          <View key={t} style={styles.gridRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeTxt}>{t}</Text>
            </View>
            {COURTS.map((c, ci) => {
              const free = isFree(ti, ci);
              return (
                <View key={c} style={[styles.slot, free ? styles.slotFree : styles.slotTaken]}>
                  <Text style={[styles.slotTxt, { color: free ? colors.accentDeep : colors.faint }]}>{free ? "空" : "×"}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.note}>
          ※ 空き状況は目安（仮表示）です。最新状況・ご予約は LaBOLA でご確認ください。
        </Text>

        <Pressable style={styles.aboutCard} onPress={() => router.push("/about")}>
          <View style={styles.aboutIcon}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>ⓘ</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aboutTitle}>THE PICKLE BANG THEORY とは？</Text>
            <Text style={styles.aboutSub}>施設・サービス・アクセスを見る</Text>
          </View>
          <Text style={{ color: colors.muted }}>›</Text>
        </Pressable>
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.reserveBtn} onPress={() => Linking.openURL(LABOLA_URL)}>
          <Text style={styles.reserveTxt}>PBTで予約する ↗</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/compose")}>
          <Text style={styles.composeLink}>空き時間で募集を投稿する</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  officialTag: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  officialTxt: { color: colors.accent, fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  dateRow: { flexGrow: 0, paddingHorizontal: 20 },
  dateRowInner: { gap: 6, paddingBottom: 8 },
  dateCell: { minWidth: 50, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  dateCellActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  dateNum: { color: colors.ink, fontSize: 18 },
  dateNumActive: { color: colors.onAccent },
  dateDow: { color: colors.muted, fontSize: 9, fontWeight: "700", marginTop: 2 },
  dateDowActive: { color: "rgba(10,10,26,0.7)" },
  body: { paddingHorizontal: 20, paddingBottom: 24 },
  gridRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  timeCol: { width: 44, alignItems: "flex-end", justifyContent: "center", paddingRight: 4 },
  timeTxt: { color: colors.ink, fontSize: 13 },
  courtHead: { flex: 1, backgroundColor: colors.court, borderRadius: 6, paddingVertical: 6, alignItems: "center" },
  courtHeadTxt: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  slot: { flex: 1, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  slotFree: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  slotTaken: { backgroundColor: "rgba(255,255,255,0.05)" },
  slotTxt: { fontSize: 10, fontWeight: "700" },
  note: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 12 },
  aboutCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, padding: 14, marginTop: 16 },
  aboutIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.court, alignItems: "center", justifyContent: "center" },
  aboutTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  aboutSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  reserveBtn: { height: 46, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  reserveTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
  composeLink: { textAlign: "center", color: colors.accent, fontSize: 11, fontWeight: "700", marginTop: 8, textDecorationLine: "underline" },
});
