import { useColorScheme } from "react-native";
import { useFileManager } from "./file-manager-store";

export const lightPalette = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#14212B",
  muted: "#687783",
  border: "#E5EBEF",
  primary: "#2C8FE8",
  navy: "#173D5C",
  danger: "#D85E5E",
  soft: "#EAF5FF",
};

export const darkPalette = {
  background: "#101923",
  surface: "#182431",
  text: "#F0F5F8",
  muted: "#AAB6BF",
  border: "#293B49",
  primary: "#69B7FF",
  navy: "#80C3FF",
  danger: "#F28A8A",
  soft: "#1D3850",
};

export function useFileTheme() {
  const { preferences } = useFileManager();
  const system = useColorScheme();
  const isDark =
    preferences.theme === "dark" ||
    (preferences.theme === "system" && system === "dark");
  const palette = isDark ? darkPalette : lightPalette;
  const background =
    preferences.background === "ocean"
      ? isDark
        ? "#10283A"
        : "#EDF7FF"
      : preferences.background === "violet"
        ? isDark
          ? "#241C38"
          : "#F7F2FF"
        : preferences.background === "sand"
          ? isDark
            ? "#2B251C"
            : "#FFF9EE"
          : palette.background;
  return { isDark, palette, background };
}
