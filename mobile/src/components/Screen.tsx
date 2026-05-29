import { View, StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

/** ダーク背景＋セーフエリアの共通ラッパ */
export function Screen({ children, edges = ["top"], style }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  inner: { flex: 1 },
});
