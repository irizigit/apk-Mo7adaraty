import "@/global.css";
import { Stack } from "expo-router";
import { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { FileManagerProvider } from "@/lib/file-manager-store";
import { AppLockGate } from "@/components/app-lock-gate";
import { FileThemeSync } from "@/components/file-theme-sync";
import { IncomingShareHandler } from "@/components/incoming-share-handler";
import { ShareIntentProvider } from "expo-share-intent";
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
    <ShareIntentProvider>
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <FileManagerProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="folder/[id]" />
                <Stack.Screen name="preview/[id]" />
                <Stack.Screen name="search" />
                <Stack.Screen name="trash" />
              </Stack>
              <IncomingShareHandler />
              <FileThemeSync />
              <AppLockGate />
            </FileManagerProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </ShareIntentProvider>
  );
}
