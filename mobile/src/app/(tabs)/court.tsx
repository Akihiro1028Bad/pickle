import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

// PBT の LaBOLA 予約カレンダーを WebView で直接ロード。
//   embed=normal で埋め込み表示、tab_name=すべて で全コートタブを初期表示。
const LABOLA_CALENDAR_URL =
  "https://yoyaku.labola.jp/r/shop/3473/calendar/?embed=normal&tab_name=すべて";

export default function CourtScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>PBT コート空き状況</Text>
        <View style={styles.officialTag}>
          <Text style={styles.officialTxt}>OFFICIAL</Text>
        </View>
      </View>

      {/* LaBOLA 予約カレンダー（WebView） */}
      <View style={styles.webWrap}>
        <WebView
          source={{ uri: LABOLA_CALENDAR_URL }}
          style={styles.web}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          )}
        />
      </View>

      <Text style={styles.note}>
        ※ 空き状況・ご予約は LaBOLA の予約カレンダーをご利用ください。
      </Text>

      <View style={styles.footer}>
        <Pressable onPress={() => router.push("/compose")}>
          <Text style={styles.composeLink}>空き時間で募集を投稿する</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/about")} style={styles.aboutRow}>
          <Text style={styles.aboutTxt}>THE PICKLE BANG THEORY とは？ ›</Text>
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
  webWrap: { flex: 1, marginHorizontal: 20, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: "#fff" },
  web: { flex: 1, backgroundColor: "#fff" },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  note: { color: colors.muted, fontSize: 11, lineHeight: 18, paddingHorizontal: 20, paddingTop: 12 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, marginTop: 12 },
  composeLink: { textAlign: "center", color: colors.accent, fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  aboutRow: { marginTop: 10, alignItems: "center" },
  aboutTxt: { color: colors.muted, fontSize: 12, fontWeight: "700" },
});
