import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { PbtBadges } from "@/components/Badges";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";
import { SUPPORT_THREAD_ID } from "@/lib/mockData";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useApp();
  const level = user.level ?? "未設定";

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* ヘッダ */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Profile</Text>
          <Avatar name={user.name} size="xl" />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.handle}>{user.handle}</Text>
          {user.badges && user.badges.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <PbtBadges badges={user.badges} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>レベル</Text>
          <View style={styles.card}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeTxt}>{[...level][0] ?? "—"}</Text>
            </View>
            <View>
              <Text style={styles.levelName}>{level}</Text>
              <Text style={styles.levelSub}>
                DUPR <Text style={{ color: colors.accent, fontWeight: "700" }}>{user.dupr ?? "—"}</Text> · doubles
              </Text>
            </View>
          </View>

          {(user.area || (user.availability && user.availability.length > 0)) && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>プレイ情報</Text>
              <View style={[styles.card, { flexDirection: "column", alignItems: "flex-start", gap: 12 }]}>
                {user.area && (
                  <View>
                    <Text style={styles.fieldLabel}>よく打つエリア</Text>
                    <Text style={styles.fieldValue}>{user.area}</Text>
                  </View>
                )}
                {user.availability && user.availability.length > 0 && (
                  <View>
                    <Text style={styles.fieldLabel}>よく空いている時間</Text>
                    <View style={styles.chipRow}>
                      {user.availability.map((s) => (
                        <View key={s} style={styles.slotChip}>
                          <Text style={styles.slotChipTxt}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {user.email && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>アカウント</Text>
              <View style={styles.card}>
                <Text style={styles.accountTxt}>
                  {user.email}
                  <Text style={styles.accountProvider}>  {user.provider === "google" ? "Google連携" : "メール登録"}</Text>
                </Text>
              </View>
            </>
          )}

          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>サポート</Text>
          <Pressable
            style={styles.supportCard}
            onPress={() => router.push({ pathname: "/thread/[id]", params: { id: SUPPORT_THREAD_ID } })}
          >
            <View style={styles.supportIcon}>
              <Text style={{ fontSize: 16 }}>💬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>運営に問い合わせる</Text>
              <Text style={styles.supportSub}>予約・料金・不具合・アカウントなど</Text>
            </View>
            <Text style={{ color: colors.muted }}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  hero: { backgroundColor: colors.court2, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  heroLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontStyle: "italic", marginBottom: 16 },
  name: { color: "#fff", fontSize: 24, fontWeight: "600", marginTop: 12 },
  handle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontStyle: "italic" },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 16, padding: 12 },
  levelBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  levelBadgeTxt: { color: colors.onAccent, fontSize: 20, fontWeight: "800", fontStyle: "italic" },
  levelName: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  levelSub: { color: colors.muted, fontSize: 11, fontStyle: "italic", marginTop: 2 },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  fieldValue: { color: colors.ink, fontSize: 13, marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  slotChip: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  slotChipTxt: { color: colors.ink2, fontSize: 11, fontWeight: "700" },
  accountTxt: { color: colors.ink2, fontSize: 12 },
  accountProvider: { color: colors.faint, fontSize: 10 },
  supportCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
  supportIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.court, alignItems: "center", justifyContent: "center" },
  supportTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  supportSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
