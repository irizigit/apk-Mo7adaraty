import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { type ComponentProps, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export const palette = {
  navy: "#173D5C",
  sky: "#2C8FE8",
  ink: "#14212B",
  muted: "#687783",
  paper: "#F7F8FA",
  card: "#FFFFFF",
  line: "#E7ECF0",
  gold: "#F2B84B",
  mint: "#2FA56C",
  danger: "#D85E5E",
};

export function Icon({ name, size = 22, color = palette.navy }: { name: IconName; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export function IconButton({ name, label, onPress, tone = "plain" }: { name: IconName; label: string; onPress: () => void; tone?: "plain" | "primary" }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, tone === "primary" && styles.iconButtonPrimary, pressed && styles.pressed]}
    >
      <Icon name={name} size={21} color={tone === "primary" ? "#FFFFFF" : palette.navy} />
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction} style={({ pressed }) => pressed && styles.pressed}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Pill({ label, color = palette.sky, background = "#EAF5FF", icon }: { label: string; color?: string; background?: string; icon?: IconName }) {
  return <View style={[styles.pill, { backgroundColor: background }]}>{icon ? <Icon name={icon} size={14} color={color} /> : null}<Text style={[styles.pillText, { color }]}>{label}</Text></View>;
}

export function AppCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressBar({ value, color = palette.sky, track = "#E6EEF5" }: { value: number; color?: string; track?: string }) {
  return <View style={[styles.progressTrack, { backgroundColor: track }]}><View style={[styles.progressValue, { backgroundColor: color, width: `${Math.max(0, Math.min(value, 100))}%` }]} /></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.line, borderRadius: 24, padding: 16, shadowColor: "#16374E", shadowOpacity: 0.045, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderColor: palette.line, borderWidth: 1, borderRadius: 15 },
  iconButtonPrimary: { backgroundColor: palette.navy, borderColor: palette.navy },
  pressed: { opacity: 0.72, transform: [{ scale: 0.975 }] },
  sectionHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 12 },
  sectionTitle: { color: palette.ink, fontSize: 18, lineHeight: 24, fontWeight: "800", writingDirection: "rtl" },
  sectionAction: { color: palette.sky, fontSize: 13, fontWeight: "800", writingDirection: "rtl" },
  pill: { flexDirection: "row-reverse", alignItems: "center", alignSelf: "flex-start", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "800", writingDirection: "rtl" },
  progressTrack: { height: 8, overflow: "hidden", borderRadius: 99 },
  progressValue: { height: "100%", borderRadius: 99 },
});
