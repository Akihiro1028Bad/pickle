import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Image, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { PbtBadges, AccentTag } from "@/components/Badges";
import { RegionChips } from "@/components/RegionChips";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";
import { regionLabel } from "@/lib/regions";
import type { Post } from "@/lib/types";

export default function BoardScreen() {
  const router = useRouter();
  const { posts, announcements, unreadNewsCount } = useApp();
  const latestNews = announcements[0];

  // 地域フィルタ：未選択＝全件。選択時＝その地域向け＋全国向け（地域未指定）。
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);

  const matchesFilter = (p: Post) => {
    if (regionFilter.length === 0) return true;
    const target = p.regions ?? [];
    if (target.length === 0) return true;
    return target.some((r) => regionFilter.includes(r));
  };
  const visible = posts.filter(matchesFilter);

  const official = visible.filter((p) => p.official);
  const featured = visible.filter((p) => p.featured && !p.official);
  const normal = visible.filter((p) => !p.featured && !p.official);
  const ordered = [...official, ...featured, ...normal];

  return (
    <Screen>
      {/* ヘッダ */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require("@/assets/images/yoko-neon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.matchTag}>
            <Text style={styles.matchTagTxt}>Match</Text>
          </View>
        </View>
        <Pressable style={styles.bell} onPress={() => router.push("/news")}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
          {unreadNewsCount > 0 && <View style={styles.bellDot} />}
        </Pressable>
      </View>

      {/* 地域フィルタ */}
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterBtn, regionFilter.length > 0 && styles.filterBtnOn]}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={[styles.filterTxt, regionFilter.length > 0 && { color: colors.accent }]}>
            📍 {regionFilter.length > 0 ? `地域: ${regionLabel(regionFilter)}` : "地域で絞り込み"}
          </Text>
        </Pressable>
        {regionFilter.length > 0 && (
          <Pressable onPress={() => setRegionFilter([])}>
            <Text style={styles.clearTxt}>クリア</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {latestNews && (
          <Pressable style={styles.newsBanner} onPress={() => router.push("/news")}>
            <Text style={{ fontSize: 14 }}>📢</Text>
            <Text style={styles.newsTitle} numberOfLines={1}>
              {latestNews.title}
            </Text>
            <Text style={styles.newsMore}>お知らせ ›</Text>
          </Pressable>
        )}

        {ordered.map((p) => (
          <PostCard key={p.id} post={p} onPress={() => router.push({ pathname: "/posts/[id]", params: { id: p.id } })} />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 投稿FAB */}
      <Pressable style={styles.fab} onPress={() => router.push("/compose")}>
        <View style={styles.fabPlus}>
          <Text style={styles.fabPlusTxt}>＋</Text>
        </View>
        <Text style={styles.fabTxt}>投稿する</Text>
      </Pressable>

      {/* 地域フィルタのシート */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.sheetFill}>
          <Pressable style={styles.sheetOverlay} onPress={() => setFilterVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetGrab} />
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>地域で絞り込み</Text>
              {regionFilter.length > 0 && (
                <Pressable onPress={() => setRegionFilter([])}>
                  <Text style={styles.clearTxt}>クリア</Text>
                </Pressable>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <RegionChips value={regionFilter} onChange={setRegionFilter} />
              <Text style={styles.sheetNote}>選んだ地域向け＋「全国向け」の投稿が表示されます。</Text>
              <View style={{ height: 12 }} />
            </ScrollView>
            <Pressable style={styles.applyBtn} onPress={() => setFilterVisible(false)}>
              <Text style={styles.applyTxt}>表示する</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const isOfficial = !!post.official;
  const isFeatured = !!post.featured && !isOfficial;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        (isOfficial || isFeatured) && styles.cardAccentEdge,
        isOfficial && styles.cardOfficial,
      ]}
    >
      <View style={styles.cardHead}>
        <Avatar name={post.author} size="sm" />
        <Text style={styles.author}>{post.author}</Text>
        {isOfficial ? <AccentTag label="✓ 公式" /> : <PbtBadges badges={post.authorBadges} />}
        {isFeatured && <AccentTag label="⭐ おすすめ" />}
        <Text style={styles.time}>{post.timeAgo}</Text>
      </View>
      <Text style={styles.body} numberOfLines={2}>
        {post.body}
      </Text>
      <View style={styles.metaRow}>
        <View style={[styles.regionChip, post.regions && post.regions.length > 0 ? styles.regionChipOn : null]}>
          <Text style={[styles.regionTxt, post.regions && post.regions.length > 0 ? { color: colors.accent } : null]}>
            📍 {regionLabel(post.regions)}
          </Text>
        </View>
        {post.duration && (
          <View style={styles.durationChip}>
            <Text style={styles.durationTxt}>🕒 {post.duration}表示</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 120, height: 24 },
  matchTag: { backgroundColor: colors.accent, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  matchTagTxt: { color: colors.onAccent, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  bell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.ember,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  list: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },
  newsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(246,255,84,0.2)",
    backgroundColor: "rgba(246,255,84,0.06)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  newsTitle: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: "700" },
  newsMore: { color: colors.accent, fontSize: 11 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  cardAccentEdge: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  cardOfficial: { backgroundColor: "rgba(246,255,84,0.05)" },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  author: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  time: { marginLeft: "auto", color: colors.faint, fontSize: 10 },
  body: { color: colors.ink2, fontSize: 13, lineHeight: 20 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 10 },
  regionChip: { backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  regionChipOn: { backgroundColor: "rgba(246,255,84,0.15)" },
  regionTxt: { color: colors.faint, fontSize: 10, fontWeight: "700" },
  durationChip: {
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationTxt: { color: colors.faint, fontSize: 10 },
  filterBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 8 },
  filterBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  filterBtnOn: { borderColor: colors.accent, backgroundColor: "rgba(246,255,84,0.1)" },
  filterTxt: { color: colors.ink2, fontSize: 12, fontWeight: "700" },
  clearTxt: { color: colors.muted, fontSize: 11, fontWeight: "700", textDecorationLine: "underline" },
  sheetFill: { flex: 1, justifyContent: "flex-end" },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { maxHeight: "85%", borderTopWidth: 1, borderTopColor: colors.borderStrong, backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  sheetGrab: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 12 },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sheetTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  sheetNote: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 12 },
  applyBtn: { marginTop: 12, height: 46, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  applyTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: colors.accent,
  },
  fabPlus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.onAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPlusTxt: { color: colors.accent, fontSize: 13, fontWeight: "900", lineHeight: 15 },
  fabTxt: { color: colors.onAccent, fontSize: 12, fontWeight: "800" },
});
