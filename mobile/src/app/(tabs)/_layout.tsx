import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { colors } from "@/lib/theme";

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        sceneStyle: { backgroundColor: colors.bgDeep },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "掲示板", tabBarIcon: ({ color }) => <TabIcon emoji="🏓" color={color} /> }}
      />
      <Tabs.Screen
        name="court"
        options={{ title: "コート", tabBarIcon: ({ color }) => <TabIcon emoji="🎾" color={color} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "メッセージ", tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "プロフィール", tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}
