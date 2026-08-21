import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export type InboxNotificationKind = "announcement" | "update" | "push" | "system";

export type InboxNotification = {
  id: string;
  kind: InboxNotificationKind;
  title: string;
  body: string;
  createdAt: number;
  actionUrl?: string | null;
  read: boolean;
};

const INBOX_KEY = "mo7adaraty-notification-inbox-v1";
const MAX_ITEMS = 80;

// إعداد كيفية ظهور الإشعار وهو في وضع التشغيل (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function loadInbox(): Promise<InboxNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(INBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveInbox(items: InboxNotification[]) {
  await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export async function addInboxNotification(input: Omit<InboxNotification, "id" | "createdAt" | "read"> & { id?: string }) {
  const items = await loadInbox();
  const id = input.id ?? `${input.kind}:${input.title}:${input.body}`;
  const existing = items.find((item) => item.id === id);
  if (existing) return items;
  const next: InboxNotification = {
    id,
    kind: input.kind,
    title: input.title,
    body: input.body,
    actionUrl: input.actionUrl ?? null,
    createdAt: Date.now(),
    read: false,
  };
  const updated = [next, ...items].slice(0, MAX_ITEMS);
  await saveInbox(updated);
  return updated;
}

export async function markInboxRead(id: string) {
  const items = await loadInbox();
  const updated = items.map((item) => item.id === id ? { ...item, read: true } : item);
  await saveInbox(updated);
  return updated;
}

export async function markAllInboxRead() {
  const items = await loadInbox();
  const updated = items.map((item) => ({ ...item, read: true }));
  await saveInbox(updated);
  return updated;
}

export async function clearInbox() {
  await AsyncStorage.removeItem(INBOX_KEY);
}

// دالة جديدة لاستقبال الإشعار فور وصوله وحفظه تلقائياً
export function setupNotificationListener(onNotificationReceived?: () => void) {
  return Notifications.addNotificationReceivedListener(async (notification) => {
    const content = notification.request.content;
    const data = content.data || {};

    await addInboxNotification({
      kind: (data.kind as InboxNotificationKind) || "push",
      title: content.title || "إشعار جديد",
      body: content.body || "",
      actionUrl: (data.url as string) || null,
    });

    if (onNotificationReceived) {
      onNotificationReceived();
    }
  });
}
