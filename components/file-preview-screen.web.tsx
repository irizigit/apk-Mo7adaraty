import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Icon } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileTheme } from "@/lib/file-theme";

export default function WebPreviewNotice() {
  const { palette } = useFileTheme();
  return (
    <ScreenContainer className="items-center justify-center px-7">
      <View style={[styles.icon, { backgroundColor: palette.soft }]}>
        <Icon name="file-eye-outline" size={38} color={palette.primary} />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>المعاينة تعمل في تطبيق أندرويد</Text>
      <Text style={[styles.text, { color: palette.muted }]}>ثبّت APK لعرض PDF والصور المخزنة محلياً داخل محاضراتي.</Text>
      <Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: palette.primary }]}>
        <Text style={styles.buttonText}>عودة</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  icon: { width: 82, height: 82, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", marginTop: 18, writingDirection: "rtl" },
  text: { textAlign: "center", marginTop: 7, writingDirection: "rtl" },
  button: { marginTop: 20, borderRadius: 15, paddingHorizontal: 22, paddingVertical: 12 },
  buttonText: { color: "#FFF", fontWeight: "900", writingDirection: "rtl" },
});
