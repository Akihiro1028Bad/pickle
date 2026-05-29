import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { PbtBadges, AccentTag } from "@/components/Badges";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts } = useApp();
  const post = posts.find((p) => p.id === id);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>募集の詳細</Text>
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
                {post.level && <Text style={styles.level}>{post.level}</Text>}
                <Text style={styles.time}>{post.timeAgo}</Text>
              </View>
            </View>

            <Text style={styles.bodyText}>{post.body}</Text>

            {post.duration && (
              <View style={styles.durationChip}>
                <Text style={styles.durationTxt}>🕒 {post.duration}表示</Text>
              </View>
            )}
          </ScrollView>

          {!post.official && !post.self && (
            <View style={styles.footer}>
              <Pressable style={styles.dmBtn} onPress={() => router.push("/messages")}>
                <Text style={styles.dmTxt}>この募集にメッセージを送る</Text>
              </Pressable>
            </View>
          )}
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
  body: { paddingHorizontal: 20, paddingTop: 8 },
  authorRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  author: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  level: { color: colors.muted, fontSize: 11, marginTop: 2 },
  time: { color: colors.faint, fontSize: 10, marginTop: 2 },
  bodyText: { color: colors.ink, fontSize: 15, lineHeight: 24, marginTop: 18 },
  durationChip: { alignSelf: "flex-start", marginTop: 16, backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  durationTxt: { color: colors.faint, fontSize: 11 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, padding: 16 },
  dmBtn: { height: 50, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  dmTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
});
