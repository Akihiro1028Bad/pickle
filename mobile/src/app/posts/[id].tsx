import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { PbtBadges, AccentTag } from "@/components/Badges";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";

const ASK_ITEMS = ["集合時間", "参加枠", "料金・支払い", "レベル感"];

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, ensureThreadForAuthor } = useApp();
  const post = posts.find((p) => p.id === id);

  const openDM = () => {
    if (!post) return;
    const threadId = ensureThreadForAuthor(post.author, post.level);
    router.push({ pathname: "/thread/[id]", params: { id: threadId } });
  };

  const onReport = () => {
    Alert.alert("この投稿を通報", "通報理由を選んでください", [
      { text: "スパム・宣伝", onPress: reported },
      { text: "不適切な内容", onPress: reported },
      { text: "なりすまし", onPress: reported },
      { text: "キャンセル", style: "cancel" },
    ]);
  };
  const reported = () => Alert.alert("通報を受け付けました", "ご報告ありがとうございます。運営が確認します。");

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>投稿の詳細</Text>
        <View style={{ width: 34 }} />
      </View>

      {!post ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTxt}>投稿が見つかりませんでした</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.authorRow}>
              <Avatar name={post.author} size="lg" />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.author}>{post.author}</Text>
                  {post.official ? <AccentTag label="✓ 公式" /> : <PbtBadges badges={post.authorBadges} />}
                </View>
                <Text style={styles.meta}>
                  {post.level ?? "中級"} · {post.timeAgo}に投稿
                  {post.duration ? ` · 🕒 ${post.duration}表示` : ""}
                </Text>
              </View>
            </View>

            <View style={styles.bodyCard}>
              <Text style={styles.bodyText}>{post.body}</Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>DMで聞いておくとよさそうなこと</Text>
              <Text style={styles.tipDesc}>
                気になる点があれば、最初のメッセージで軽く確認しておくと当日スムーズです。
              </Text>
              <View style={styles.tipGrid}>
                {ASK_ITEMS.map((it) => (
                  <Text key={it} style={styles.tipItem}>
                    {it}
                  </Text>
                ))}
              </View>
            </View>

            <Pressable style={styles.reportBtn} onPress={onReport}>
              <Text style={styles.reportTxt}>⚠️ この投稿を通報する</Text>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.dmBtn} onPress={openDM}>
              <Text style={styles.dmTxt}>💬 DMで相談する</Text>
            </Pressable>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8 },
  back: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backTxt: { color: colors.ink, fontSize: 20, lineHeight: 22 },
  headerTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTxt: { color: colors.muted, fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 4 },
  authorRow: { flexDirection: "row", gap: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 16 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  author: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  bodyCard: { marginTop: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, padding: 16 },
  bodyText: { color: colors.ink, fontSize: 13, lineHeight: 26 },
  tipCard: { marginTop: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: 10, padding: 12 },
  tipTitle: { color: colors.ink, fontSize: 11, fontWeight: "700" },
  tipDesc: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  tipGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  tipItem: { color: colors.muted, fontSize: 11, width: "50%", marginBottom: 4 },
  reportBtn: { alignItems: "center", paddingVertical: 12, marginTop: 8 },
  reportTxt: { color: colors.faint, fontSize: 11 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, padding: 16 },
  dmBtn: { height: 48, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  dmTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
});
