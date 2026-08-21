import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useThemeContext } from "@/lib/theme-provider";
import { useFileManager } from "@/lib/file-manager-store";

export function FileThemeSync() {
  const systemScheme = useColorScheme() ?? "light";
  const { preferences } = useFileManager();
  const { setColorScheme } = useThemeContext();
  const scheme =
    preferences.theme === "system" ? systemScheme : preferences.theme;
  useEffect(() => {
    setColorScheme(scheme);
  }, [scheme, setColorScheme]);
  return <StatusBar style={scheme === "dark" ? "light" : "dark"} />;
}
