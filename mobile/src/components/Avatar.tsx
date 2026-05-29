import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";

const PALETTE = ["#306ec3", "#c2410c", "#7c3aed", "#0e7490", "#b45309", "#be185d", "#15803d"];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

type Size = "sm" | "md" | "lg" | "xl";
const DIM: Record<Size, number> = { sm: 28, md: 36, lg: 44, xl: 72 };
const FONT: Record<Size, number> = { sm: 12, md: 15, lg: 18, xl: 30 };

interface AvatarProps {
  name: string;
  size?: Size;
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const dim = DIM[size];
  const initial = [...(name || "?")][0]?.toUpperCase() ?? "?";
  return (
    <View
      style={[
        styles.base,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: colorFor(name) },
      ]}
    >
      <Text style={[styles.txt, { fontSize: FONT[size] }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  txt: { color: "#fff", fontWeight: "800" },
});
