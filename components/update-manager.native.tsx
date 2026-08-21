import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { currentVersionCode, fetchAnnouncement, fetchUpdateManifest, registerForPushNotifications, reportInstallationActivity, type UpdateManifest } from "@/lib/app-updates";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ANNOUNCEMENT_KEY = "mo7adaraty-last-announcement-v2";

function isSafeExternalUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\//i.test(value);
}

export function UpdateManager() {
  const { preferences } = useFileManager();
  const { palette } = useFileTheme();
  const [update, setUpdate] = useState<UpdateManifest | null>(null);

  useEffect(() => {
    const openFromNotification = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (isSafeExternalUrl(url)) void Linking.openURL(url);
    };
    const initial = Notifications.getLastNotificationResponse();
    if (initial?.notification) openFromNotification(initial.notification);
    const listener = Notifications.addNotificationResponseReceivedListener((response) => {
      openFromNotification(response.notification);
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    const listener = Notifications.addPushTokenListener((token) => {
      if (!preferences.notificationsEnabled) return;
      void reportInstallationActivity({
        versionCode: currentVersionCode(),
        notificationsAllowed: true,
        expoPushToken: token.data,
      });
    });
    return () => listener.remove();
  }, [preferences.notificationsEnabled]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      const versionCode = currentVersionCode();
      // سجّل التثبيت فوراً؛ الحصول على رمز FCM قد يتأخر أو يفشل مؤقتاً ولا يجب أن يمنع عداد الأجهزة.
      void reportInstallationActivity({
        versionCode,
        notificationsAllowed: false,
        expoPushToken: null,
      });
      const [manifest, announcement] = await Promise.all([
        fetchUpdateManifest(),
        fetchAnnouncement(),
      ]);
      if (!alive) return;
      if (manifest && (manifest.versionCode > versionCode || manifest.minSupportedVersionCode > versionCode)) setUpdate(manifest);
      if (preferences.notificationsEnabled) {
        const push = await registerForPushNotifications(false);
        if (push.allowed && push.token) {
          void reportInstallationActivity({
            versionCode,
            notificationsAllowed: true,
            expoPushToken: push.token,
          });
        }
      }
      if (announcement) {
        const marker = `${announcement.created_at ?? ""}:${announcement.title}:${announcement.body}`;
        const seen = await AsyncStorage.getItem(ANNOUNCEMENT_KEY);
        if (alive && seen !== marker) {
          Alert.alert(announcement.title, announcement.body, [
            announcement.action_url && isSafeExternalUrl(announcement.action_url)
              ? { text: "عرض", onPress: () => void Linking.openURL(announcement.action_url!) }
              : { text: "حسناً" },
          ]);
          await AsyncStorage.setItem(ANNOUNCEMENT_KEY, marker);
        }
      }
    };
    void run();
    return () => { alive = false; };
  }, [preferences.analyticsEnabled, preferences.notificationsEnabled]);

  if (!update) return null;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={update.forceUpdate ? undefined : () => setUpdate(null)}>
      <View style={styles.overlay}><View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={[styles.badge, { backgroundColor: palette.soft }]}><Text style={[styles.badgeText, { color: palette.primary }]}>تحديث جديد</Text></View>
        <Text style={[styles.title, { color: palette.text }]}>محاضراتي {update.versionName}</Text>
        <Text style={[styles.copy, { color: palette.muted }]}>{update.message}</Text>
        <Pressable onPress={() => void Linking.openURL(update.downloadPageUrl)} style={[styles.primary, { backgroundColor: palette.primary }]}><Text style={styles.primaryText}>تنزيل التحديث</Text></Pressable>
        {!update.forceUpdate ? <Pressable onPress={() => setUpdate(null)} style={styles.later}><Text style={[styles.laterText, { color: palette.muted }]}>لاحقاً</Text></Pressable> : <Text style={[styles.required, { color: palette.muted }]}>هذا التحديث مطلوب للاستمرار في استخدام النسخة المدعومة.</Text>}
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(5,11,21,0.64)" },
  card: { borderRadius: 26, padding: 23, borderWidth: 1 },
  badge: { alignSelf: "flex-end", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "900", writingDirection: "rtl" },
  title: { fontSize: 23, fontWeight: "900", textAlign: "right", writingDirection: "rtl", marginTop: 15 },
  copy: { fontSize: 13, lineHeight: 22, textAlign: "right", writingDirection: "rtl", marginTop: 9 },
  primary: { height: 50, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 23 },
  primaryText: { color: "#FFF", fontSize: 14, fontWeight: "900", writingDirection: "rtl" },
  later: { alignItems: "center", paddingTop: 15, paddingBottom: 2 },
  laterText: { fontSize: 13, fontWeight: "800", writingDirection: "rtl" },
  required: { textAlign: "center", fontSize: 11, writingDirection: "rtl", marginTop: 14 },
});
