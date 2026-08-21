import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const SITE_URL = "https://irizi.unaux.com/mo7adaraty-apk";
const INSTALLATION_KEY = "mo7adaraty-installation-id-v1";

export type UpdateManifest = {
  versionName: string;
  versionCode: number;
  minSupportedVersionCode: number;
  downloadPageUrl: string;
  message: string;
  forceUpdate: boolean;
};

export type RemoteAnnouncement = {
  title: string;
  body: string;
  action_url?: string | null;
  created_at?: string;
};

export type PushRegistration = {
  allowed: boolean;
  token: string | null;
  reason?: "web" | "not_physical_device" | "permission_denied" | "project_unconfigured" | "token_unavailable";
};

function withTimeout(url: string, timeout = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } }).finally(() => clearTimeout(timer));
}

function randomInstallationId() {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export async function getInstallationId() {
  let id = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (!id) {
    id = randomInstallationId();
    await AsyncStorage.setItem(INSTALLATION_KEY, id);
  }
  return id;
}

export async function fetchUpdateManifest(): Promise<UpdateManifest | null> {
  try {
    const response = await withTimeout(`${SITE_URL}/version.json?ts=${Date.now()}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (typeof data?.versionCode !== "number" || typeof data?.downloadPageUrl !== "string") return null;
    return data as UpdateManifest;
  } catch {
    return null;
  }
}

export async function fetchAnnouncement(): Promise<RemoteAnnouncement | null> {
  try {
    const response = await withTimeout(`${SITE_URL}/api/announcement.php?ts=${Date.now()}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.announcement?.title && data?.announcement?.body ? data.announcement as RemoteAnnouncement : null;
  } catch {
    return null;
  }
}

export async function registerForPushNotifications(requestPermission: boolean): Promise<PushRegistration> {
  if (Platform.OS === "web") return { allowed: false, token: null, reason: "web" };
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("updates", {
      name: "تحديثات محاضراتي",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 100, 180],
      lightColor: "#568DFF",
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && requestPermission) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return { allowed: false, token: null, reason: "permission_denied" };
  if (!Device.isDevice) return { allowed: false, token: null, reason: "not_physical_device" };
  const projectId =
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.pushProjectId as string | undefined);
  if (!projectId) return { allowed: false, token: null, reason: "project_unconfigured" };
  try {
    return { allowed: true, token: (await Notifications.getExpoPushTokenAsync({ projectId })).data };
  } catch {
    return { allowed: false, token: null, reason: "token_unavailable" };
  }
}

export async function reportInstallationActivity(options: {
  versionCode: number;
  notificationsAllowed: boolean;
  expoPushToken?: string | null;
}): Promise<boolean> {
  try {
    const installationId = await getInstallationId();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(`${SITE_URL}/api/ping.php`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ installationId, ...options }),
      });
      if (!response.ok) return false;
      const payload = await response.json().catch(() => null);
      return payload?.ok === true;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    // يجب ألا يؤثر تعذر الإحصاءات على استخدام ملفات الطالب.
    return false;
  }
}

export function currentVersionCode() {
  return Number(Constants.expoConfig?.android?.versionCode ?? 1);
}
