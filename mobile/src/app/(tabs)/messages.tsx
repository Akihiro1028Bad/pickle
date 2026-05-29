import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { AccentTag } from "@/components/Badges";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function MessagesScreen() {
  const router = useRouter();
  const { threads } = useApp();
  const sorted = [...threads].sort((a, b) => Number(!!b.official) - Number(!!a.official));

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>メッセージ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {sorted.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => router.push({ pathname: "/thread/[id]", params: { id: t.id } })}
            style={[styles.row, t.official ? styles.rowOfficial : t.unread ? styles.rowUnread : null]}
          >
            <Avatar name={t.name} size="lg" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.rowTop}>
                <View style={styles.nameWrap}>
                  <Text style={styles.name}>{t.name}</Text>
                  {t.official && <AccentTag label="公式" />}
                </View>
                <Text style={styles.time}>{t.time}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {t.preview}
              </Text>
              {t.meta && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaTxt} numberOfLines={1}>
                    {t.meta}
                  </Text>
                </View>
              )}
            </View>
            {t.unread ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadTxt}>{t.unread}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  title: { color: colors.ink, fontSize: 22, fontWeight: "600", letterSpacing: -0.5 },
  list: { paddingHorizontal: 16, gap: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
  },
  rowOfficial: { borderColor: "rgba(246,255,84,0.3)", backgroundColor: "rgba(246,255,84,0.05)" },
  rowUnread: { borderColor: "rgba(246,255,84,0.35)" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nameWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  time: { color: colors.faint, fontSize: 10 },
  preview: { color: colors.muted, fontSize: 11, marginTop: 4 },
  metaChip: { alignSelf: "flex-start", marginTop: 4, backgroundColor: colors.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  metaTxt: { color: colors.faint, fontSize: 10, fontWeight: "700" },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.ember, alignItems: "center", justifyContent: "center" },
  unreadTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
