import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bgDeep }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bgDeep },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="posts/[id]" />
            <Stack.Screen name="thread/[id]" />
            <Stack.Screen name="compose" options={{ presentation: "modal" }} />
            <Stack.Screen name="news" />
            <Stack.Screen name="about" />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
