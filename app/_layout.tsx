import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { StudyProvider } from "@/lib/study-store";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const providerInitialMetrics = useMemo(() => {
    if (!initialWindowMetrics) return undefined;
    return {
      ...initialWindowMetrics,
      insets: {
        ...initialWindowMetrics.insets,
        top: Math.max(initialWindowMetrics.insets.top, 16),
        bottom: Math.max(initialWindowMetrics.insets.bottom, 12),
      },
    };
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StudyProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="course/[id]" />
            </Stack>
            <StatusBar style="auto" />
          </StudyProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
