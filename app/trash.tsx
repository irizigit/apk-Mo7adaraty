import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/app-ui";
import {
  FolderCard,
  ManagedFileRow,
  SelectionToolbar,
} from "@/components/file-manager-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

type Selected = Array<{ id: string; kind: "folder" | "file" }>;

export default function TrashScreen() {
  const {
    folders,
    files,
    restoreItems,
    deleteForever,
    childFolders,
    childFiles,
  } = useFileManager();
  const { palette, background } = useFileTheme();
  const [selection, setSelection] = useState<Selected>([]);
  const trashedFolders = folders.filter((item) => item.trashedAt !== null);
  const trashedFiles = useMemo(
    () => files.filter((item) => item.trashedAt !== null),
    [files],
  );
  const isSelected = (id: string) => selection.some((item) => item.id === id);
  const toggle = (id: string, kind: "folder" | "file") =>
    setSelection((current) =>
      current.some((item) => item.id === id)
        ? current.filter((item) => item.id !== id)
        : [...current, { id, kind }],
    );
  const permanentlyDelete = () =>
    Alert.alert("حذف نهائي", "لن تتمكن من استعادة العناصر بعد الحذف النهائي.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteForever(selection);
          setSelection([]);
        },
      },
    ]);
  return (
    <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
      <View style={[styles.full, { backgroundColor: background }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.back,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Icon name="arrow-right" color={palette.text} />
          </Pressable>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>
              سلة المهملات
            </Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>
              يمكنك استعادة العناصر أو حذفها نهائياً
            </Text>
          </View>
        </View>
        {selection.length ? (
          <View style={styles.trashTools}>
            <Pressable onPress={() => setSelection([])}>
              <Text style={[styles.toolText, { color: palette.primary }]}>
                إلغاء
              </Text>
            </Pressable>
            <Text style={[styles.selectedText, { color: palette.text }]}>
              {selection.length} محدد
            </Text>
            <View style={styles.toolActions}>
              <Pressable
                onPress={() => {
                  restoreItems(selection);
                  setSelection([]);
                }}
              >
                <Icon name="backup-restore" color={palette.primary} size={23} />
              </Pressable>
              <Pressable onPress={permanentlyDelete}>
                <Icon
                  name="delete-forever-outline"
                  color={palette.danger}
                  size={24}
                />
              </Pressable>
            </View>
          </View>
        ) : null}
        <FlatList
          data={trashedFiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            trashedFolders.length ? (
              <>
                <Text style={[styles.label, { color: palette.muted }]}>
                  مجلدات
                </Text>
                <View style={styles.grid}>
                  {trashedFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      count={
                        childFolders(folder.id, true).length +
                        childFiles(folder.id, true).length
                      }
                      selected={isSelected(folder.id)}
                      onPress={() => toggle(folder.id, "folder")}
                      onLongPress={() => toggle(folder.id, "folder")}
                    />
                  ))}
                </View>
                <Text style={[styles.label, { color: palette.muted }]}>
                  ملفات
                </Text>
              </>
            ) : null
          }
          renderItem={({ item }) => (
            <ManagedFileRow
              file={item}
              selected={isSelected(item.id)}
              onPress={() => toggle(item.id, "file")}
              onLongPress={() => toggle(item.id, "file")}
              onMore={() => toggle(item.id, "file")}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon
                name="trash-can-outline"
                color={palette.primary}
                size={50}
              />
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                سلة المهملات فارغة
              </Text>
              <Text style={[styles.emptyText, { color: palette.muted }]}>
                ستظهر هنا العناصر التي تحذفها مؤقتاً.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
    paddingTop: 5,
    marginBottom: 15,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2,
    writingDirection: "rtl",
    textAlign: "right",
  },
  trashTools: {
    height: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  toolText: { fontWeight: "900", writingDirection: "rtl" },
  selectedText: { fontWeight: "900", writingDirection: "rtl" },
  toolActions: { flexDirection: "row-reverse", gap: 17 },
  list: { paddingBottom: 25 },
  label: {
    fontSize: 12,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
    marginTop: 7,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  empty: { alignItems: "center", paddingTop: 95, paddingHorizontal: 30 },
  emptyTitle: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  emptyText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 13,
    writingDirection: "rtl",
  },
});
