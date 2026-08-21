import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Icon } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileTheme } from "@/lib/file-theme";
import { clearInbox, loadInbox, markAllInboxRead, markInboxRead, setupNotificationListener, type InboxNotification } from "@/lib/notification-inbox";

function relativeDate(value: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

export default function NotificationsScreen() {
  const { palette } = useFileTheme();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const reload = useCallback(async () => setItems(await loadInbox()), []);
  
  useEffect(() => { 
    void reload(); 
    // الاستماع للإشعارات الواردة وتحديث القائمة
    const subscription = setupNotificationListener(() => {
      void reload();
    });
    return () => subscription.remove();
  }, [reload]);
  
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  const openItem = async (item: InboxNotification) => {
    setItems(await markInboxRead(item.id));
    if (item.actionUrl?.startsWith("https://")) await Linking.openURL(item.actionUrl);
  };
  const unread = items.filter((item) => !item.read).length;

  return (
    <ScreenContainer className="px-5">
      <View style={styles.header}>
        <Pressable onPress={() => void reload()} style={[styles.roundButton, { backgroundColor: palette.soft }]}>
          <Icon name="refresh" color={palette.primary} size={20} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: palette.primary }]}>مركزك الخاص</Text>
          <Text style={[styles.title, { color: palette.text }]}>الإشعارات</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{unread ? `${unread} غير مقروء` : "كل شيء تحت السيطرة"}</Text>
        </View>
        <View style={[styles.bell, { backgroundColor: palette.soft }]}><Icon name="bell-outline" color={palette.primary} size={24} /></View>
      </View>
      {items.length > 0 ? (
        <View style={styles.actions}>
          <Pressable onPress={async () => setItems(await markAllInboxRead())}><Text style={[styles.actionText, { color: palette.primary }]}>تحديد الكل كمقروء</Text></Pressable>
          <Pressable onPress={() => Alert.alert("مسح الإشعارات", "هل تريد إزالة كل الإشعارات من هذا الجهاز؟", [{ text: "إلغاء", style: "cancel" }, { text: "مسح", style: "destructive", onPress: async () => { await clearInbox(); setItems([]); } }])}><Text style={[styles.actionText, { color: palette.muted }]}>مسح الكل</Text></Pressable>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={items.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<View style={[styles.empty, { backgroundColor: palette.surface, borderColor: palette.border }]}><View style={[styles.emptyIcon, { backgroundColor: palette.soft }]}><Icon name="bell-off-outline" color={palette.primary} size={27} /></View><Text style={[styles.emptyTitle, { color: palette.text }]}>لا توجد إشعارات بعد</Text><Text style={[styles.emptyCopy, { color: palette.muted }]}>ستظهر هنا الإعلانات والتنبيهات ورسائل التحديث عند وصولها.</Text></View>}
        renderItem={({ item }) => <Pressable onPress={() => void openItem(item)} style={[styles.item, { backgroundColor: item.read ? palette.surface : palette.soft, borderColor: palette.border }]}><View style={[styles.itemIcon, { backgroundColor: item.kind === "update" ? palette.primary : palette.surface }]}><Icon name={item.kind === "update" ? "update" : item.kind === "announcement" ? "bullhorn-outline" : "bell-outline"} color={item.kind === "update" ? "#FFF" : palette.primary} size={20} /></View><View style={styles.itemCopy}><Text style={[styles.itemTitle, { color: palette.text }]}>{item.title}</Text><Text numberOfLines={2} style={[styles.itemBody, { color: palette.muted }]}>{item.body}</Text><Text style={[styles.itemTime, { color: palette.muted }]}>{relativeDate(item.createdAt)}</Text></View>{!item.read ? <View style={[styles.dot, { backgroundColor: palette.primary }]} /> : null}</Pressable>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 11, paddingTop: 7, marginBottom: 18 },
  headerCopy: { flex: 1, alignItems: "flex-end" },
  eyebrow: { fontSize: 11, fontWeight: "900", writingDirection: "rtl" },
  title: { fontSize: 26, fontWeight: "900", writingDirection: "rtl", marginTop: 2 },
  subtitle: { fontSize: 11, writingDirection: "rtl", marginTop: 2 },
  bell: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  roundButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 13 },
  actionText: { fontSize: 12, fontWeight: "900", writingDirection: "rtl" },
  list: { gap: 10, paddingBottom: 28 },
  emptyList: { flexGrow: 1, justifyContent: "center", paddingBottom: 80 },
  empty: { borderWidth: 1, borderRadius: 24, padding: 28, alignItems: "center" },
  emptyIcon: { width: 58, height: 58, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 14, fontSize: 17, fontWeight: "900", writingDirection: "rtl" },
  emptyCopy: { marginTop: 6, textAlign: "center", lineHeight: 20, fontSize: 12, writingDirection: "rtl" },
  item: { minHeight: 93, borderWidth: 1, borderRadius: 20, padding: 13, flexDirection: "row-reverse", alignItems: "center", gap: 11 },
  itemIcon: { width: 41, height: 41, borderRadius: 14, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  itemCopy: { flex: 1, alignItems: "flex-end" },
  itemTitle: { fontSize: 13, fontWeight: "900", writingDirection: "rtl", textAlign: "right" },
  itemBody: { marginTop: 3, fontSize: 11, lineHeight: 17, writingDirection: "rtl", textAlign: "right" },
  itemTime: { marginTop: 5, fontSize: 10, writingDirection: "rtl" },
  dot: { width: 8, height: 8, borderRadius: 4, alignSelf: "flex-start", marginTop: 4 },
});
