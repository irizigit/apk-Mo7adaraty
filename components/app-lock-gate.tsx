import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "./app-ui";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export function AppLockGate() {
  const { isLocked, unlockWithPin, unlockWithBiometrics, preferences } =
    useFileManager();
  const { palette, background } = useFileTheme();
  const [pin, setPin] = useState("");
  const unlock = async () => {
    const success = await unlockWithPin(pin);
    if (!success)
      Alert.alert("رمز غير صحيح", "تحقق من رمز PIN ثم حاول مجدداً.");
    else setPin("");
  };
  return (
    <Modal
      visible={isLocked}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={[styles.badge, { backgroundColor: palette.soft }]}>
          <Icon name="folder-lock-outline" size={34} color={palette.primary} />
        </View>
        <Text style={[styles.title, { color: palette.text }]}>
          تطبيق محاضراتي مقفل
        </Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          أدخل رمز PIN للمتابعة إلى ملفاتك.
        </Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          placeholder="••••"
          placeholderTextColor={palette.muted}
          style={[
            styles.input,
            {
              color: palette.text,
              borderColor: palette.border,
              backgroundColor: palette.surface,
            },
          ]}
          textAlign="center"
          autoFocus
        />
        <Pressable
          onPress={unlock}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: palette.navy },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.primaryText}>فتح التطبيق</Text>
        </Pressable>
        {preferences.biometricEnabled ? (
          <Pressable onPress={() => unlockWithBiometrics()} style={styles.bio}>
            <Icon name="fingerprint" color={palette.primary} size={23} />
            <Text style={[styles.bioText, { color: palette.primary }]}>
              استخدام البصمة
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: { fontSize: 24, fontWeight: "900", writingDirection: "rtl" },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    writingDirection: "rtl",
  },
  input: {
    marginTop: 28,
    width: "100%",
    height: 58,
    borderWidth: 1,
    borderRadius: 18,
    fontSize: 24,
    letterSpacing: 8,
  },
  primary: {
    marginTop: 14,
    width: "100%",
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  bio: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
    marginTop: 24,
    padding: 10,
  },
  bioText: { fontWeight: "800", writingDirection: "rtl" },
});
