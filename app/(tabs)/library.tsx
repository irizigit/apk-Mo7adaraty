import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

export default function LibraryScreen() {
  const {
    childFolders,
    childFiles,
    importFiles,
    trashItems,
    toggleFavorite,
    shareFile,
    shareFolder,
    renameItem,
    preferences,
    updatePreferences,
  } = useFileManager();
  const { palette, background } = useFileTheme();
  const [query, setQuery] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [selection, setSelection] = useState<Selected>([]);
  const [moveOpen, setMoveOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    kind: "folder" | "file";
    name: string;
  } | null>(null);
  const direction = preferences.sortDescending ? -1 : 1;
  const compare = (
    a: { name: string; updatedAt: number; size?: number; extension?: string },
    b: { name: string; updatedAt: number; size?: number; extension?: string },
  ) => {
    if (preferences.sortBy === "name")
      return a.name.localeCompare(b.name, "ar") * direction;
    if (preferences.sortBy === "size")
      return ((a.size ?? 0) - (b.size ?? 0)) * direction;
    if (preferences.sortBy === "type")
      return (a.extension ?? "").localeCompare(b.extension ?? "") * direction;
    return (a.updatedAt - b.updatedAt) * direction;
  };
  const rootFolders = useMemo(
    () =>
      childFolders(null)
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .sort(compare),
    [childFolders, query, preferences.sortBy, preferences.sortDescending],
  );
  const rootFiles = useMemo(
    () =>
      childFiles(null)
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .sort(compare),
    [childFiles, query, preferences.sortBy, preferences.sortDescending],
  );
  const isSelected = (id: string) => selection.some((item) => item.id === id);
  const toggle = (id: string, kind: "folder" | "file") =>
    setSelection((current) =>
      current.some((item) => item.id === id)
        ? current.filter((item) => item.id !== id)
        : [...current, { id, kind }],
    );
  const selectAll = () =>
    setSelection([
      ...rootFolders.map((item) => ({ id: item.id, kind: "folder" as const })),
      ...rootFiles.map((item) => ({ id: item.id, kind: "file" as const })),
    ]);
  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) await importFiles(null, result.assets);
  };
  const share = async () => {
    if (selection.length !== 1)
      return Alert.alert("المشاركة", "اختر ملفاً أو مجلداً واحداً لمشاركته.");
    const selected = selection[0];
    const shared =
      selected.kind === "folder"
        ? await shareFolder(rootFolders.find((folder) => folder.id === selected.id)!)
        : await shareFile(rootFiles.find((file) => file.id === selected.id)!);
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
  const nextSort = () => {
    const modes = ["date", "name", "size", "type"] as const;
    const index = modes.indexOf(preferences.sortBy);
    updatePreferences({ sortBy: modes[(index + 1) % modes.length] });
  };
  const sortLabel =
    preferences.sortBy === "date"
      ? "الأحدث"
      : preferences.sortBy === "name"
        ? "الاسم"
        : preferences.sortBy === "size"
          ? "الحجم"
          : "النوع";
  const prepareRename = () => {
    if (selection.length !== 1)
      return Alert.alert(
        "إعادة التسمية",
        "اختر عنصراً واحداً فقط لإعادة تسميته.",
      );
    const selected = selection[0];
    const item =
      selected.kind === "folder"
        ? rootFolders.find((folder) => folder.id === selected.id)
        : rootFiles.find((file) => file.id === selected.id);
    if (item)
      setRenameTarget({
        id: selected.id,
        kind: selected.kind,
        name: item.name,
      });
  };
  return (
    <ScreenContainer className="px-5">
      <FolderEditorSheet
        visible={newFolder}
        parentId={null}
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
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              مكتبتي المحلية
            </Text>
            <Text style={[styles.title, { color: palette.text }]}>
              ملفاتك ومجلداتك
            </Text>
          </View>
          <Pressable
            onPress={() => setNewFolder(true)}
            style={[styles.addButton, { backgroundColor: palette.navy }]}
          >
            <Icon name="folder-plus-outline" color="#FFF" size={22} />
          </Pressable>
        </View>
        <View
          style={[
            styles.search,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Icon name="magnify" color={palette.muted} size={21} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث في المكتبة"
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, { color: palette.text }]}
            textAlign="right"
          />
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
          <View style={styles.controls}>
            <Pressable
              onPress={pickFiles}
              style={[styles.importButton, { backgroundColor: palette.soft }]}
            >
              <Icon
                name="file-import-outline"
                color={palette.primary}
                size={20}
              />
              <Text style={[styles.importText, { color: palette.primary }]}>
                استيراد ملفات
              </Text>
            </Pressable>
            <Pressable
              onPress={nextSort}
              style={[
                styles.sortButton,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <Icon name="sort-variant" color={palette.muted} size={18} />
              <Text style={[styles.sortText, { color: palette.muted }]}>
                {sortLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                updatePreferences({
                  folderView:
                    preferences.folderView === "grid" ? "list" : "grid",
                })
              }
              style={[
                styles.viewButton,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <Icon
                name={
                  preferences.folderView === "grid"
                    ? "view-list-outline"
                    : "view-grid-outline"
                }
                color={palette.muted}
                size={21}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/trash" as any)}
              style={[
                styles.viewButton,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <Icon name="trash-can-outline" color={palette.muted} size={21} />
            </Pressable>
          </View>
        )}
        <FlatList
          data={rootFiles}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {rootFolders.length ? (
                <>
                  <Text style={[styles.label, { color: palette.muted }]}>
                    مجلدات
                  </Text>
                  <View
                    style={
                      preferences.folderView === "grid"
                        ? styles.grid
                        : styles.folderList
                    }
                  >
                    {rootFolders.map((folder) => (
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
              {rootFiles.length ? (
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
            !rootFolders.length ? (
              <View style={styles.empty}>
                <Icon
                  name="folder-open-outline"
                  color={palette.primary}
                  size={48}
                />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  مكتبتك جاهزة للتنظيم
                </Text>
                <Text style={[styles.emptyText, { color: palette.muted }]}>
                  أنشئ مجلداً أو استورد ملفاتك من الهاتف.
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
  header: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 6,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  title: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    height: 51,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 14,
    gap: 9,
  },
  searchInput: { flex: 1, fontSize: 14, writingDirection: "rtl" },
  controls: { flexDirection: "row-reverse", gap: 8, marginVertical: 14 },
  importButton: {
    height: 43,
    paddingHorizontal: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    borderRadius: 14,
    flex: 1,
  },
  importText: { fontWeight: "900", fontSize: 12, writingDirection: "rtl" },
  sortButton: {
    height: 43,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderRadius: 14,
  },
  sortText: { fontSize: 10, fontWeight: "800", writingDirection: "rtl" },
  viewButton: {
    width: 43,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
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
  folderList: { gap: 5 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    writingDirection: "rtl",
  },
  selectAll: { alignSelf: "flex-end", marginTop: -7, marginBottom: 8 },
  selectAllText: { fontSize: 12, fontWeight: "900", writingDirection: "rtl" },
});
