import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

const FEATURES = [
  { icon: "🎾", title: "屋内ピックルボール専用コート", desc: "天候を気にせず一年中プレイ可能。最新のコートサーフェス。" },
  { icon: "🥒", title: "手ぶらでOK・レンタル充実", desc: "パドル・ボールのレンタルあり。初めての方も気軽に。" },
  { icon: "👥", title: "初心者デー・イベント開催", desc: "レベル別の時間帯や交流イベントを定期開催。" },
  { icon: "📍", title: "アクセス良好", desc: "駅近・駐車場あり。仕事帰りにも立ち寄りやすい立地。" },
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
        <View style={styles.hero}>
          <Text style={styles.heroBrand}>THE PICKLE{"\n"}BANG THEORY</Text>
          <Text style={styles.heroSub}>都市型・屋内ピックルボール施設</Text>
        </View>

        <Text style={styles.lead}>
          「打つ楽しさ」を、もっと身近に。PBTは初心者からプレイヤーまで、誰もが気軽に集まれるピックルボールのコミュニティ拠点です。
        </Text>

        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featCard}>
            <Text style={styles.featIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featTitle}>{f.title}</Text>
              <Text style={styles.featDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.linkBtn} onPress={() => Linking.openURL("https://thepicklebang.com")}>
          <Text style={styles.linkTxt}>公式サイトを見る ↗</Text>
        </Pressable>
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
  body: { paddingHorizontal: 20, paddingTop: 8 },
  hero: { backgroundColor: colors.court2, borderRadius: 16, padding: 24, alignItems: "center" },
  heroBrand: { color: colors.accent, fontSize: 22, fontWeight: "900", textAlign: "center", letterSpacing: 1, lineHeight: 28 },
  heroSub: { color: colors.ink2, fontSize: 12, marginTop: 10 },
  lead: { color: colors.ink2, fontSize: 13, lineHeight: 21, marginTop: 18 },
  featCard: { flexDirection: "row", gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginTop: 12 },
  featIcon: { fontSize: 22 },
  featTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  featDesc: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 3 },
  linkBtn: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginTop: 20 },
  linkTxt: { color: colors.accent, fontSize: 14, fontWeight: "800" },
});
