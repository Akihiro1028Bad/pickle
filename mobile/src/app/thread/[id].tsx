import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Avatar } from "@/components/Avatar";
import { AccentTag } from "@/components/Badges";
import { useApp } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function ThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, sendMessage, receiveMessage, markRead } = useApp();
  const thread = threads.find((t) => t.id === id);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const ackedRef = useRef(false);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  const onSend = () => {
    const body = text.trim();
    if (!body || !thread) return;
    sendMessage(thread.id, body);
    setText("");
    // 運営サポート窓口は、最初の送信に自動で受付返信（受信体験のデモ）
    if (thread.official && !ackedRef.current) {
      ackedRef.current = true;
      const tid = thread.id;
      setTimeout(() => {
        receiveMessage(
          tid,
          "お問い合わせありがとうございます🥒\n担当者が内容を確認し、こちらのトークでご返信します。営業時間内は通常1営業日以内にお返事します。",
        );
      }, 1200);
    }
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        {thread && <Avatar name={thread.name} size="md" />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.nameRow}>
            <Text style={styles.headerName}>{thread?.name ?? "DM"}</Text>
            {thread?.official && <AccentTag label="公式" />}
          </View>
          {!!thread?.meta && <Text style={styles.headerMeta}>{thread.meta}</Text>}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.dayLabel}>今日</Text>
          {thread?.messages.length === 0 && (
            <Text style={styles.emptyHint}>メッセージを送ってみましょう</Text>
          )}
          {thread?.messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.fromSelf && styles.bubbleRowSelf]}>
              <Avatar name={m.fromSelf ? "あなた" : thread.name} size="sm" />
              <View style={{ maxWidth: "72%" }}>
                <View style={[styles.bubble, m.fromSelf ? styles.bubbleSelf : styles.bubbleOther]}>
                  <Text style={[styles.bubbleTxt, m.fromSelf && { color: colors.onAccent }]}>{m.text}</Text>
                </View>
                <Text style={[styles.bubbleTime, m.fromSelf && { textAlign: "right" }]}>{m.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={styles.plusBtn}>
            <Text style={{ color: colors.ink2, fontSize: 18 }}>＋</Text>
          </View>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="メッセージを入力..."
            placeholderTextColor={colors.faint}
            multiline
          />
          <Pressable style={[styles.send, !text.trim() && styles.sendDisabled]} onPress={onSend} disabled={!text.trim()}>
            <Text style={[styles.sendTxt, !text.trim() && { color: colors.faint }]}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  back: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backTxt: { color: colors.ink, fontSize: 18, lineHeight: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  headerMeta: { color: colors.muted, fontSize: 10, marginTop: 1 },
  messages: { padding: 14, gap: 10 },
  dayLabel: { textAlign: "center", color: colors.faint, fontSize: 11, fontStyle: "italic" },
  emptyHint: { textAlign: "center", color: colors.faint, fontSize: 11, marginTop: 24 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bubbleRowSelf: { flexDirection: "row-reverse" },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleSelf: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleTxt: { color: colors.ink, fontSize: 13, lineHeight: 20 },
  bubbleTime: { color: colors.faint, fontSize: 9, marginTop: 3, fontStyle: "italic" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  plusBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, maxHeight: 100, minHeight: 36, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, color: colors.ink, fontSize: 13 },
  send: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  sendDisabled: { backgroundColor: "rgba(255,255,255,0.1)" },
  sendTxt: { color: colors.onAccent, fontSize: 16, fontWeight: "800" },
});
