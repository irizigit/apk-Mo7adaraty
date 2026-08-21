import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { setBackgroundColorAsync } from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { useThemeContext } from "@/lib/theme-provider";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export function FileThemeSync() {
  const systemScheme = useColorScheme() ?? "light";
  const { preferences } = useFileManager();
  const { setColorScheme } = useThemeContext();
  const { background } = useFileTheme();
  const scheme =
    preferences.theme === "system" ? systemScheme : preferences.theme;
  useEffect(() => {
    setColorScheme(scheme);
  }, [scheme, setColorScheme]);
  useEffect(() => {
    setBackgroundColorAsync(background).catch(() => undefined);
  }, [background]);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setStyle(scheme === "dark" ? "dark" : "light");
  }, [scheme]);
  return (
    <StatusBar
      style={scheme === "dark" ? "light" : "dark"}
      backgroundColor={background}
      translucent={false}
    />
  );
}
