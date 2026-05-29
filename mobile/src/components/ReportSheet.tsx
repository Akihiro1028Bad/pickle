import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "@/lib/theme";

/** 通報理由（管理画面の通報カテゴリに対応） */
export const REPORT_REASONS = [
  "スパム・宣伝／外部サービスへの誘導",
  "迷惑行為・ハラスメント",
  "なりすまし・虚偽情報",
  "不適切・不快な内容",
  "その他",
] as const;

export type ReportTargetType = "post" | "dm" | "user" | "profile";

const TYPE_LABEL: Record<ReportTargetType, string> = {
  post: "投稿",
  dm: "メッセージ",
  user: "ユーザー",
  profile: "プロフィール",
};

interface ReportSheetProps {
  visible: boolean;
  targetType: ReportTargetType;
  targetLabel: string;
  onClose: () => void;
  onSubmit?: (reason: string, detail: string) => void;
}

export function ReportSheet({ visible, targetType, targetLabel, onClose, onSubmit }: ReportSheetProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  // 開くたびに初期化
  useEffect(() => {
    if (visible) {
      setReason(null);
      setDetail("");
      setDone(false);
    }
  }, [visible]);

  const submit = () => {
    if (!reason) return;
    onSubmit?.(reason, detail.trim());
    setDone(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="閉じる" />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {done ? (
            <View style={styles.doneWrap}>
              <View style={styles.doneIcon}>
                <Text style={{ fontSize: 22, color: colors.accent }}>✓</Text>
              </View>
              <Text style={styles.doneTitle}>通報を受け付けました</Text>
              <Text style={styles.doneDesc}>
                ご報告ありがとうございます。運営が内容を確認し、必要に応じて対応します。
              </Text>
              <Pressable style={styles.primaryBtn} onPress={onClose}>
                <Text style={styles.primaryTxt}>閉じる</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>{TYPE_LABEL[targetType]}を通報</Text>
              <Text style={styles.subtitle}>
                対象：<Text style={{ color: colors.ink2 }}>{targetLabel}</Text>
                {"\n"}通報内容は運営のみが確認します。相手には通知されません。
              </Text>

              <View style={styles.reasonList}>
                {REPORT_REASONS.map((r) => {
                  const on = reason === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setReason(r)}
                      style={[styles.reasonRow, on ? styles.reasonRowOn : styles.reasonRowOff]}
                    >
                      <View style={[styles.radio, on ? styles.radioOn : styles.radioOff]}>
                        {on && <Text style={styles.radioCheck}>✓</Text>}
                      </View>
                      <Text style={[styles.reasonTxt, on && { color: colors.ink }]}>{r}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                style={styles.detail}
                value={detail}
                onChangeText={setDetail}
                placeholder="詳細があれば記入してください（任意）"
                placeholderTextColor={colors.faint}
                multiline
              />

              <View style={styles.actions}>
                <Pressable style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelTxt}>キャンセル</Text>
                </Pressable>
                <Pressable
                  style={[styles.reportBtn, !reason && styles.reportBtnDisabled]}
                  onPress={submit}
                  disabled={!reason}
                >
                  <Text style={[styles.reportTxt, !reason && { color: colors.faint }]}>通報する</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    maxHeight: "88%",
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 12 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 4 },
  reasonList: { marginTop: 16, gap: 8 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  reasonRowOn: { borderColor: colors.accent, backgroundColor: "rgba(246,255,84,0.08)" },
  reasonRowOff: { borderColor: colors.border, backgroundColor: colors.bg },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  radioOff: { borderColor: "rgba(255,255,255,0.25)" },
  radioCheck: { color: colors.onAccent, fontSize: 11, fontWeight: "800" },
  reasonTxt: { flex: 1, color: colors.ink2, fontSize: 13 },
  detail: { marginTop: 12, minHeight: 72, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.ink, fontSize: 12, textAlignVertical: "top" },
  actions: { flexDirection: "row", gap: 8, marginTop: 16 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  cancelTxt: { color: colors.ink2, fontSize: 14, fontWeight: "700" },
  reportBtn: { flex: 1.4, height: 44, borderRadius: 8, backgroundColor: colors.ember, alignItems: "center", justifyContent: "center" },
  reportBtnDisabled: { backgroundColor: "rgba(255,255,255,0.1)" },
  reportTxt: { color: "#fff", fontSize: 14, fontWeight: "800" },
  doneWrap: { paddingVertical: 24, alignItems: "center" },
  doneIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(246,255,84,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  doneTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  doneDesc: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 8, paddingHorizontal: 8 },
  primaryBtn: { marginTop: 20, height: 44, width: "100%", borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  primaryTxt: { color: colors.onAccent, fontSize: 14, fontWeight: "800" },
});
