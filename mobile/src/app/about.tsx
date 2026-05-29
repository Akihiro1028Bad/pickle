import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

const OFFICIAL_SITE = "https://www.thepicklebang.com/";
const LABOLA_URL = "https://labola.jp/r/";

const FACILITY = [
  { icon: "📍", label: "アクセス", value: "本八幡駅 徒歩1分" },
  { icon: "🎾", label: "コート", value: "屋内 3コート" },
  { icon: "🕒", label: "営業", value: "早朝〜深夜（24時間利用可）※仮" },
];

const SERVICES = [
  { t: "コートレンタル", d: "1時間単位でコートを予約。手ぶらOK・パドルレンタルあり。" },
  { t: "レッスン & クリニック", d: "初心者から経験者まで。基礎・戦術を体系的に。" },
  { t: "大会 & イベント", d: "リーグ戦・交流会・初心者デーなどを定期開催。" },
];

export default function AboutScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>PBTについて</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* ヒーロー */}
        <View style={styles.hero}>
          <Text style={styles.heroBrand}>THE PICKLE BANG THEORY</Text>
          <Text style={styles.heroLead}>ピックルボールのビッグバンが、ここから始まる。</Text>
          <Text style={styles.heroTagline}>Small Dink, Big Match.</Text>
        </View>

        {/* 施設情報 */}
        <Text style={styles.sectionLabel}>施設情報</Text>
        <View style={styles.infoCard}>
          {FACILITY.map((f, i) => (
            <View key={f.label} style={[styles.infoRow, i < FACILITY.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoIcon}>{f.icon}</Text>
              <Text style={styles.infoLabel}>{f.label}</Text>
              <Text style={styles.infoValue}>{f.value}</Text>
            </View>
          ))}
        </View>

        {/* できること */}
        <Text style={styles.sectionLabel}>できること</Text>
        <View style={{ gap: 8 }}>
          {SERVICES.map((s) => (
            <View key={s.t} style={styles.svcCard}>
              <Text style={styles.svcTitle}>{s.t}</Text>
              <Text style={styles.svcDesc}>{s.d}</Text>
            </View>
          ))}
        </View>

        {/* 初心者歓迎 */}
        <View style={styles.beginnerCard}>
          <Text style={styles.beginnerTitle}>🔰 初心者、大歓迎です</Text>
          <Text style={styles.beginnerDesc}>
            ルールが分からなくても大丈夫。レンタルパドルで手ぶらで来て、まずは打ってみるところから。
          </Text>
        </View>

        {/* リンク */}
        <View style={{ gap: 8, marginTop: 24 }}>
          <Pressable style={styles.primaryBtn} onPress={() => Linking.openURL(OFFICIAL_SITE)}>
            <Text style={styles.primaryTxt}>公式サイトを見る ↗</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => Linking.openURL(LABOLA_URL)}>
            <Text style={styles.secondaryTxt}>コートを予約する（LaBOLA）↗</Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          ※ 施設情報は仮の内容を含みます。正式な情報・最新の営業時間は公式サイトをご確認ください。
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8 },
  back: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backTxt: { color: colors.ink, fontSize: 20, lineHeight: 22 },
  headerTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  body: { paddingHorizontal: 20, paddingTop: 4 },
  hero: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.court2, borderRadius: 16, padding: 20 },
  heroBrand: { color: colors.accent, fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  heroLead: { color: "#fff", fontSize: 15, fontWeight: "700", lineHeight: 23, marginTop: 16 },
  heroTagline: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 8, letterSpacing: 0.5 },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  infoCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  infoIcon: { fontSize: 16 },
  infoLabel: { width: 72, color: colors.muted, fontSize: 11 },
  infoValue: { flex: 1, color: colors.ink, fontSize: 13 },
  svcCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  svcTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  svcDesc: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  beginnerCard: { marginTop: 16, borderWidth: 1, borderColor: "rgba(246,255,84,0.2)", backgroundColor: "rgba(246,255,84,0.07)", borderRadius: 16, padding: 16 },
  beginnerTitle: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  beginnerDesc: { color: colors.ink2, fontSize: 12, lineHeight: 18, marginTop: 4 },
  primaryBtn: { height: 48, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  primaryTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
  secondaryBtn: { height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  secondaryTxt: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  disclaimer: { color: colors.faint, fontSize: 11, lineHeight: 18, marginTop: 16 },
});
