import { useEffect } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function NewsScreen() {
  const router = useRouter();
  const { announcements, markNewsRead } = useApp();

  useEffect(() => {
    markNewsRead();
  }, [markNewsRead]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>お知らせ</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {announcements.map((a) => (
          <View key={a.id} style={[styles.card, a.important && styles.cardImportant]}>
            <View style={styles.cardTop}>
              {a.important && (
                <View style={styles.importantTag}>
                  <Text style={styles.importantTxt}>重要</Text>
                </View>
              )}
              <Text style={styles.date}>{a.publishedAt}</Text>
            </View>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.bodyTxt}>{a.body}</Text>
          </View>
        ))}
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
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
  cardImportant: { borderColor: "rgba(255,106,61,0.4)" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  importantTag: { backgroundColor: "rgba(255,106,61,0.15)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  importantTxt: { color: colors.ember, fontSize: 10, fontWeight: "800" },
  date: { color: colors.faint, fontSize: 11, marginLeft: "auto" },
  title: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  bodyTxt: { color: colors.ink2, fontSize: 12, lineHeight: 19, marginTop: 6 },
});
