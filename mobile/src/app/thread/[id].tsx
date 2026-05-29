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
  const { threads, sendMessage, markRead } = useApp();
  const thread = threads.find((t) => t.id === id);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  const onSend = () => {
    const t = text.trim();
    if (!t || !id) return;
    sendMessage(id, t);
    setText("");
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{thread?.name ?? "トーク"}</Text>
          {thread?.official && <AccentTag label="公式" />}
        </View>
        <View style={{ width: 34 }} />
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
          {thread?.messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.fromSelf ? styles.rowSelf : styles.rowOther]}>
              {!m.fromSelf && <Avatar name={thread.name} size="sm" />}
              <View style={[styles.bubble, m.fromSelf ? styles.bubbleSelf : styles.bubbleOther]}>
                <Text style={[styles.bubbleTxt, m.fromSelf && { color: colors.onAccent }]}>{m.text}</Text>
                <Text style={[styles.bubbleTime, m.fromSelf && { color: "rgba(10,10,26,0.5)" }]}>{m.time}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 8 }} />
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="メッセージを入力…"
            placeholderTextColor={colors.faint}
            multiline
          />
          <Pressable style={[styles.send, !text.trim() && styles.sendDisabled]} onPress={onSend} disabled={!text.trim()}>
            <Text style={styles.sendTxt}>送信</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  backTxt: { color: colors.ink, fontSize: 20, lineHeight: 22 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  messages: { padding: 16, gap: 10 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "100%" },
  rowSelf: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleSelf: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleTxt: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  bubbleTime: { color: colors.faint, fontSize: 9, marginTop: 4, alignSelf: "flex-end" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, maxHeight: 120, minHeight: 40, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, color: colors.ink, fontSize: 14 },
  send: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.4 },
  sendTxt: { color: colors.onAccent, fontSize: 13, fontWeight: "800" },
});
