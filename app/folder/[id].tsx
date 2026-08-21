import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
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
  FolderEditorSheet,
  ManagedFileRow,
  MoveSheet,
  RenameSheet,
  SelectionToolbar,
} from "@/components/file-manager-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

type Selected = Array<{ id: string; kind: "folder" | "file" }>;

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    folders,
    childFolders,
    childFiles,
    folderTrail,
    importFiles,
    trashItems,
    toggleFavorite,
    shareFile,
    shareFolder,
    renameItem,
    preferences,
  } = useFileManager();
  const { palette, background } = useFileTheme();
  const [newFolder, setNewFolder] = useState(false);
  const [selection, setSelection] = useState<Selected>([]);
  const [moveOpen, setMoveOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    kind: "folder" | "file";
    name: string;
  } | null>(null);
  const current = folders.find((folder) => folder.id === id);
  const subfolders = childFolders(id);
  const files = useMemo(
    () =>
      childFiles(id).sort((a, b) =>
        preferences.sortDescending
          ? b.updatedAt - a.updatedAt
          : a.updatedAt - b.updatedAt,
      ),
    [childFiles, id, preferences.sortDescending],
  );
  const trail = folderTrail(id);
  const isSelected = (itemId: string) =>
    selection.some((item) => item.id === itemId);
  const toggle = (itemId: string, kind: "folder" | "file") =>
    setSelection((currentSelection) =>
      currentSelection.some((item) => item.id === itemId)
        ? currentSelection.filter((item) => item.id !== itemId)
        : [...currentSelection, { id: itemId, kind }],
    );
  const selectAll = () =>
    setSelection([
      ...subfolders.map((item) => ({ id: item.id, kind: "folder" as const })),
      ...files.map((item) => ({ id: item.id, kind: "file" as const })),
    ]);
  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) await importFiles(id, result.assets);
  };
  const share = async () => {
    if (selection.length !== 1)
      return Alert.alert("المشاركة", "اختر ملفاً أو مجلداً واحداً لمشاركته.");
    const selected = selection[0];
    const shared =
      selected.kind === "folder"
        ? await shareFolder(subfolders.find((folder) => folder.id === selected.id)!)
        : await shareFile(files.find((file) => file.id === selected.id)!);
    if (!shared)
      Alert.alert("المشاركة", "لا توجد ملفات صالحة لمشاركة هذا المجلد.");
    setSelection([]);
  };
  const favorite = () => {
    selection.forEach((item) => toggleFavorite(item.id, item.kind));
    setSelection([]);
  };
  const trash = () => {
    Alert.alert(
      "نقل إلى سلة المهملات",
      `هل تريد نقل ${selection.length} عنصر إلى سلة المهملات؟ يمكنك استعادته لاحقاً.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نقل إلى السلة",
          style: "destructive",
          onPress: () => {
            trashItems(selection);
            setSelection([]);
          },
        },
      ],
    );
  };
  const prepareRename = () => {
    if (selection.length !== 1)
      return Alert.alert(
        "إعادة التسمية",
        "اختر عنصراً واحداً فقط لإعادة تسميته.",
      );
    const selected = selection[0];
    const item =
      selected.kind === "folder"
        ? subfolders.find((folder) => folder.id === selected.id)
        : files.find((file) => file.id === selected.id);
    if (item)
      setRenameTarget({
        id: selected.id,
        kind: selected.kind,
        name: item.name,
      });
  };
  if (!current)
    return (
      <ScreenContainer
        className="items-center justify-center px-6"
      >
        <Icon name="folder-alert-outline" size={42} color={palette.primary} />
        <Text style={[styles.notFound, { color: palette.text }]}>
          هذا المجلد غير متاح
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backText, { color: palette.primary }]}>
            العودة إلى مكتبتي
          </Text>
        </Pressable>
      </ScreenContainer>
    );
  return (
    <ScreenContainer className="px-5">
      <FolderEditorSheet
        visible={newFolder}
        parentId={id}
        onClose={() => setNewFolder(false)}
      />
      <MoveSheet
        visible={moveOpen}
        selection={selection}
        onClose={() => setMoveOpen(false)}
      />
      <RenameSheet
        visible={!!renameTarget}
        initialValue={renameTarget?.name ?? ""}
        label="إعادة تسمية"
        onClose={() => setRenameTarget(null)}
        onSave={async (name) => {
          if (renameTarget) {
            await renameItem(renameTarget.id, renameTarget.kind, name);
            setSelection([]);
          }
        }}
      />
      <View style={[styles.full, { backgroundColor: background }]}>
        <View style={styles.topbar}>
          <View style={styles.rightActions}>
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.iconButton,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Icon name="arrow-right" color={palette.text} />
            </Pressable>
            <View>
              <Text
                numberOfLines={1}
                style={[styles.title, { color: palette.text }]}
              >
                {current.name}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.trail, { color: palette.muted }]}
              >
                {trail.map((item) => item.name).join(" / ")}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setNewFolder(true)}
            style={[styles.iconButton, { backgroundColor: current.color }]}
          >
            <Icon name="folder-plus-outline" color="#FFF" />
          </Pressable>
        </View>
        {selection.length ? (
          <>
            <SelectionToolbar
              selection={selection}
              onClear={() => setSelection([])}
              onMove={() => setMoveOpen(true)}
              onRename={prepareRename}
              onFavorite={favorite}
              onShare={share}
              onTrash={trash}
              canShare={selection.length === 1}
            />
            <Pressable onPress={selectAll} style={styles.selectAll}>
              <Text style={[styles.selectAllText, { color: palette.primary }]}>
                تحديد الكل
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.quickActions}>
            <Pressable
              onPress={pickFiles}
              style={[
                styles.quickAction,
                { backgroundColor: `${current.color}18` },
              ]}
            >
              <Icon
                name="file-import-outline"
                color={current.color}
                size={20}
              />
              <Text style={[styles.quickText, { color: current.color }]}>
                استيراد ملفات
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setNewFolder(true)}
              style={[
                styles.quickAction,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Icon
                name="folder-plus-outline"
                color={palette.primary}
                size={20}
              />
              <Text style={[styles.quickText, { color: palette.primary }]}>
                مجلد فرعي
              </Text>
            </Pressable>
          </View>
        )}
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {subfolders.length ? (
                <>
                  <Text style={[styles.label, { color: palette.muted }]}>
                    مجلدات فرعية
                  </Text>
                  <View style={styles.grid}>
                    {subfolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        count={
                          childFolders(folder.id).length +
                          childFiles(folder.id).length
                        }
                        selected={isSelected(folder.id)}
                        onPress={() =>
                          selection.length
                            ? toggle(folder.id, "folder")
                            : router.push({
                                pathname: "/folder/[id]",
                                params: { id: folder.id },
                              } as any)
                        }
                        onLongPress={() => toggle(folder.id, "folder")}
                      />
                    ))}
                  </View>
                </>
              ) : null}
              {files.length ? (
                <Text style={[styles.label, { color: palette.muted }]}>
                  ملفات
                </Text>
              ) : null}
            </>
          }
          renderItem={({ item }) => (
            <ManagedFileRow
              file={item}
              selected={isSelected(item.id)}
              onPress={() =>
                selection.length
                  ? toggle(item.id, "file")
                  : router.push({ pathname: "/preview/[id]", params: { id: item.id } } as any)
              }
              onLongPress={() => toggle(item.id, "file")}
              onMore={() => toggle(item.id, "file")}
            />
          )}
          ListEmptyComponent={
            !subfolders.length ? (
              <View style={styles.empty}>
                <Icon
                  name="folder-open-outline"
                  color={current.color}
                  size={48}
                />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  هذا المجلد فارغ
                </Text>
                <Text style={[styles.emptyText, { color: palette.muted }]}>
                  أضف ملفات أو أنشئ مجلداً فرعياً لتنظيم محتواه.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  topbar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    marginBottom: 15,
  },
  rightActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  trail: {
    fontSize: 10,
    marginTop: 3,
    writingDirection: "rtl",
    textAlign: "right",
    maxWidth: 210,
  },
  quickActions: { flexDirection: "row-reverse", gap: 8, marginBottom: 14 },
  quickAction: {
    flex: 1,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row-reverse",
    gap: 7,
  },
  quickText: { fontSize: 12, fontWeight: "900", writingDirection: "rtl" },
  selectAll: { alignSelf: "flex-end", marginTop: -7, marginBottom: 8 },
  selectAllText: { fontSize: 12, fontWeight: "900", writingDirection: "rtl" },
  list: { paddingBottom: 28 },
  label: {
    fontSize: 12,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
    marginTop: 5,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  empty: { alignItems: "center", paddingTop: 90, paddingHorizontal: 30 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 13,
    writingDirection: "rtl",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    writingDirection: "rtl",
  },
  notFound: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
    writingDirection: "rtl",
  },
  backText: { fontWeight: "900", marginTop: 12, writingDirection: "rtl" },
});
