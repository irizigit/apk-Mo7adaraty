import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { Icon } from "@/components/app-ui";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export function IncomingShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();
  const { folders, importIncomingFiles } = useFileManager();
  const { palette } = useFileTheme();
  const [visible, setVisible] = useState(false);

  const incoming = shareIntent.files ?? [];
  useEffect(() => {
    if (hasShareIntent && incoming.length) setVisible(true);
  }, [hasShareIntent, incoming.length]);

  const saveInto = async (folderId: string | null) => {
    await importIncomingFiles(
      folderId,
      incoming.map((file) => ({
        uri: file.path,
        name: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
      })),
    );
    resetShareIntent();
    setVisible(false);
    if (folderId) {
      router.push({ pathname: "/folder/[id]", params: { id: folderId } } as never);
    } else {
      router.replace("/library" as never);
    }
  };

  const dismiss = () => {
    resetShareIntent();
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={[styles.grabber, { backgroundColor: palette.border }]} />
          <View style={styles.heading}>
            <View style={[styles.icon, { backgroundColor: palette.soft }]}>
              <Icon name="share-variant-outline" color={palette.primary} size={24} />
            </View>
            <View style={styles.headingText}>
              <Text style={[styles.title, { color: palette.text }]}>حفظ في محاضراتي</Text>
              <Text style={[styles.subtitle, { color: palette.muted }]}>
                {incoming.length} ملف وارد من تطبيق آخر
              </Text>
            </View>
          </View>
          <Text style={[styles.label, { color: palette.muted }]}>اختر المجلد الوجهة</Text>
          <ScrollView style={styles.choices} showsVerticalScrollIndicator={false}>
            <Pressable
              onPress={() => saveInto(null)}
              style={[styles.choice, { borderColor: palette.border }]}
            >
              <Icon name="home-variant-outline" color={palette.primary} size={21} />
              <Text style={[styles.choiceText, { color: palette.text }]}>المكتبة الرئيسية</Text>
            </Pressable>
            {folders
              .filter((folder) => folder.trashedAt === null)
              .map((folder) => (
                <Pressable
                  key={folder.id}
                  onPress={() => saveInto(folder.id)}
                  style={[styles.choice, { borderColor: palette.border }]}
                >
                  <Icon name={folder.icon as never} color={folder.color} size={21} />
                  <Text style={[styles.choiceText, { color: palette.text }]}>{folder.name}</Text>
                </Pressable>
              ))}
          </ScrollView>
          <Pressable onPress={dismiss} style={styles.dismiss}>
            <Text style={[styles.dismissText, { color: palette.muted }]}>ليس الآن</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(4,13,20,0.48)" },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 30, maxHeight: "78%" },
  grabber: { width: 44, height: 5, borderRadius: 6, alignSelf: "center", marginBottom: 17 },
  heading: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  icon: { width: 47, height: 47, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  headingText: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 19, fontWeight: "900", writingDirection: "rtl" },
  subtitle: { marginTop: 3, fontSize: 12, writingDirection: "rtl" },
  label: { marginTop: 22, marginBottom: 8, fontSize: 12, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  choices: { maxHeight: 310 },
  choice: { minHeight: 56, flexDirection: "row-reverse", alignItems: "center", gap: 12, borderBottomWidth: 1 },
  choiceText: { fontSize: 14, fontWeight: "800", writingDirection: "rtl" },
  dismiss: { alignSelf: "center", marginTop: 18, padding: 8 },
  dismissText: { fontWeight: "800", writingDirection: "rtl" },
});
