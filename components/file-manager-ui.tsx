import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "./app-ui";
import type {
  FolderItem,
  FolderSize,
  ManagedFile,
} from "@/lib/file-manager-store";
import {
  fileIcon,
  formatBytes,
  useFileManager,
} from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

type Selection = Array<{ id: string; kind: "folder" | "file" }>;

const FOLDER_COLORS = [
  "#2C8FE8",
  "#2FA56C",
  "#8B6FD6",
  "#D99C29",
  "#D85E5E",
  "#1E8E8A",
];
const FOLDER_ICONS = [
  "folder-star-outline",
  "folder-account-outline",
  "folder-heart-outline",
  "folder-lock-outline",
  "folder-music-outline",
  "folder-multiple-image",
  "folder-cog-outline",
  "folder-information-outline",
];

export function FolderCard({
  folder,
  count,
  selected,
  onPress,
  onLongPress,
}: {
  folder: FolderItem;
  count: number;
  selected?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { palette } = useFileTheme();
  const size =
    folder.viewSize === "small" ? 116 : folder.viewSize === "large" ? 178 : 145;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={({ pressed }) => [
        styles.folderCard,
        {
          width: size,
          minHeight: size * 0.84,
          borderColor: selected ? folder.color : palette.border,
          backgroundColor: selected ? `${folder.color}18` : palette.surface,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.folderGlyphWrap}>
        <View style={[styles.folderTab, { backgroundColor: folder.color }]} />
        <View style={[styles.folderIcon, { backgroundColor: folder.color }]}>
          <Icon
            name={folder.icon as any}
            size={folder.viewSize === "large" ? 33 : 28}
            color="#FFF"
          />
        </View>
      </View>
      <Text
        numberOfLines={2}
        style={[
          styles.folderName,
          {
            color: palette.text,
            fontSize: folder.viewSize === "large" ? 16 : 14,
          },
        ]}
      >
        {folder.name}
      </Text>
      <Text style={[styles.meta, { color: palette.muted }]}>{count} عنصر</Text>
      {selected ? (
        <View style={[styles.checkBadge, { backgroundColor: folder.color }]}>
          <Icon name="check" size={13} color="#FFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

export function ManagedFileRow({
  file,
  selected,
  onPress,
  onLongPress,
  onMore,
}: {
  file: ManagedFile;
  selected?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onMore: () => void;
}) {
  const { palette } = useFileTheme();
  const tint = file.mimeType.startsWith("image/")
    ? "#BC658D"
    : file.mimeType.startsWith("video/")
      ? "#6F64C6"
      : file.mimeType.startsWith("audio/")
        ? "#1D8D86"
        : file.extension === "pdf"
          ? "#D85E5E"
          : "#2C8FE8";
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={({ pressed }) => [
        styles.fileRow,
        {
          borderBottomColor: palette.border,
          backgroundColor: selected ? `${tint}15` : "transparent",
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.fileIcon, { backgroundColor: `${tint}18` }]}>
        <Icon name={fileIcon(file) as any} size={25} color={tint} />
      </View>
      <View style={styles.fileInfo}>
        <Text
          numberOfLines={1}
          style={[styles.fileName, { color: palette.text }]}
        >
          {file.name}
        </Text>
        <Text style={[styles.meta, { color: palette.muted }]}>
          {formatBytes(file.size)} ·{" "}
          {new Date(file.updatedAt).toLocaleDateString("ar")}
        </Text>
      </View>
      {selected ? (
        <View style={[styles.rowCheck, { backgroundColor: tint }]}>
          <Icon name="check" size={14} color="#FFF" />
        </View>
      ) : (
        <Pressable
          accessibilityLabel={`المزيد عن ${file.name}`}
          onPress={onMore}
          style={styles.moreButton}
        >
          <Icon name="dots-vertical" size={21} color={palette.muted} />
        </Pressable>
      )}
    </Pressable>
  );
}

export function SelectionToolbar({
  selection,
  onClear,
  onMove,
  onRename,
  onFavorite,
  onShare,
  onTrash,
  canShare,
}: {
  selection: Selection;
  onClear: () => void;
  onMove: () => void;
  onRename?: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onTrash: () => void;
  canShare: boolean;
}) {
  const { palette } = useFileTheme();
  return (
    <View style={[styles.selectionToolbar, { backgroundColor: palette.navy }]}>
      <Pressable onPress={onClear} style={styles.toolButton}>
        <Icon name="close" color="#FFF" size={22} />
      </Pressable>
      <Text style={styles.selectionTitle}>{selection.length} محدد</Text>
      <View style={styles.toolbarActions}>
        <Pressable onPress={onMove} style={styles.toolButton}>
          <Icon name="folder-move-outline" color="#FFF" size={22} />
        </Pressable>
        {onRename ? (
          <Pressable onPress={onRename} style={styles.toolButton}>
            <Icon name="pencil-outline" color="#FFF" size={21} />
          </Pressable>
        ) : null}
        <Pressable onPress={onFavorite} style={styles.toolButton}>
          <Icon name="star-outline" color="#FFF" size={22} />
        </Pressable>
        {canShare ? (
          <Pressable onPress={onShare} style={styles.toolButton}>
            <Icon name="share-variant-outline" color="#FFF" size={22} />
          </Pressable>
        ) : null}
        <Pressable onPress={onTrash} style={styles.toolButton}>
          <Icon name="trash-can-outline" color="#FFF" size={22} />
        </Pressable>
      </View>
    </View>
  );
}

export function FolderEditorSheet({
  visible,
  parentId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  parentId: string | null;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { createFolder, preferences } = useFileManager();
  const { palette } = useFileTheme();
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [icon, setIcon] = useState(FOLDER_ICONS[0]);
  const [size, setSize] = useState<FolderSize>(preferences.defaultFolderSize);
  const save = () => {
    const id = createFolder({
      name: name || "مجلد جديد",
      parentId,
      color,
      icon,
      viewSize: size,
    });
    setName("");
    onCreated?.(id);
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={[styles.grabber, { backgroundColor: palette.border }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>
              مجلد جديد
            </Text>
            <Pressable onPress={onClose}>
              <Icon name="close" color={palette.muted} />
            </Pressable>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="اسم المجلد"
            placeholderTextColor={palette.muted}
            style={[
              styles.input,
              {
                color: palette.text,
                borderColor: palette.border,
                backgroundColor: palette.background,
              },
            ]}
            textAlign="right"
            autoFocus
          />
          <View
            style={[
              styles.folderPreview,
              { backgroundColor: `${color}15`, borderColor: `${color}40` },
            ]}
          >
            <View style={styles.previewGlyphWrap}>
              <View style={[styles.previewTab, { backgroundColor: color }]} />
              <View style={[styles.previewGlyph, { backgroundColor: color }]}>
                <Icon name={icon as any} color="#FFF" size={25} />
              </View>
            </View>
            <View style={styles.previewTextWrap}>
              <Text
                numberOfLines={1}
                style={[styles.previewName, { color: palette.text }]}
              >
                {name || "مجلد المحاضرات"}
              </Text>
              <Text style={[styles.previewHint, { color: palette.muted }]}>
                معاينة شكل المجلد
              </Text>
            </View>
          </View>
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            اللون
          </Text>
          <View style={styles.optionRow}>
            {FOLDER_COLORS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setColor(item)}
                style={[
                  styles.colorOption,
                  { backgroundColor: item },
                  color === item && styles.colorSelected,
                ]}
              />
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            الأيقونة
          </Text>
          <View style={styles.optionRow}>
            {FOLDER_ICONS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setIcon(item)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor:
                      icon === item ? `${color}20` : palette.background,
                    borderColor: icon === item ? color : palette.border,
                  },
                ]}
              >
                <Icon
                  name={item as any}
                  color={icon === item ? color : palette.muted}
                  size={21}
                />
              </Pressable>
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            حجم المجلد في المكتبة
          </Text>
          <View style={styles.sizeRow}>
            {(["small", "medium", "large"] as FolderSize[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => setSize(item)}
                style={[
                  styles.sizeOption,
                  {
                    borderColor: size === item ? color : palette.border,
                    backgroundColor:
                      size === item ? `${color}16` : palette.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sizeText,
                    { color: size === item ? color : palette.muted },
                  ]}
                >
                  {item === "small"
                    ? "صغير"
                    : item === "medium"
                      ? "متوسط"
                      : "كبير"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={save}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: color },
              pressed && styles.pressed,
            ]}
          >
            <Icon name="folder-plus-outline" color="#FFF" size={21} />
            <Text style={styles.saveText}>إنشاء المجلد</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function RenameSheet({
  visible,
  initialValue,
  label,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialValue: string;
  label: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const { palette } = useFileTheme();
  const [value, setValue] = useState(initialValue);
  const close = () => {
    setValue(initialValue);
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={close}
    >
      <View style={styles.dialogOverlay}>
        <View style={[styles.dialog, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sheetTitle, { color: palette.text }]}>
            {label}
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            style={[
              styles.input,
              {
                color: palette.text,
                borderColor: palette.border,
                backgroundColor: palette.background,
              },
            ]}
            textAlign="right"
            autoFocus
          />
          <View style={styles.dialogActions}>
            <Pressable onPress={close} style={styles.textButton}>
              <Text style={[styles.textButtonText, { color: palette.muted }]}>
                إلغاء
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSave(value);
                close();
              }}
              style={styles.textButton}
            >
              <Text style={[styles.textButtonText, { color: palette.primary }]}>
                حفظ
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MoveSheet({
  visible,
  selection,
  onClose,
}: {
  visible: boolean;
  selection: Selection;
  onClose: () => void;
}) {
  const { folders, moveItems } = useFileManager();
  const { palette } = useFileTheme();
  const choices = useMemo(
    () =>
      folders.filter(
        (folder) =>
          folder.trashedAt === null &&
          !selection.some(
            (item) => item.kind === "folder" && item.id === folder.id,
          ),
      ),
    [folders, selection],
  );
  const move = (folderId: string | null) => {
    moveItems(selection, folderId);
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: palette.surface, maxHeight: "70%" },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: palette.border }]} />
          <Text
            style={[
              styles.sheetTitle,
              { color: palette.text, marginBottom: 12 },
            ]}
          >
            نقل العناصر إلى
          </Text>
          <Pressable
            onPress={() => move(null)}
            style={[styles.moveRoot, { borderColor: palette.border }]}
          >
            <Icon name="home-variant-outline" color={palette.primary} />
            <Text style={[styles.moveText, { color: palette.text }]}>
              مكتبتي الرئيسية
            </Text>
          </Pressable>
          <FlatList
            data={choices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => move(item.id)}
                style={[styles.moveRoot, { borderColor: palette.border }]}
              >
                <Icon name={item.icon as any} color={item.color} />
                <Text style={[styles.moveText, { color: palette.text }]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  folderCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 13,
    justifyContent: "space-between",
    position: "relative",
    marginBottom: 10,
  },
  folderGlyphWrap: {
    width: 52,
    height: 49,
    position: "relative",
    paddingTop: 5,
  },
  folderTab: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 23,
    height: 13,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  folderIcon: {
    width: 48,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    shadowColor: "#102331",
    shadowOpacity: 0.17,
    shadowRadius: 6,
    elevation: 3,
  },
  folderName: {
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
    marginTop: 10,
  },
  meta: {
    fontSize: 11,
    marginTop: 4,
    writingDirection: "rtl",
    textAlign: "right",
  },
  checkBadge: {
    position: "absolute",
    left: 9,
    top: 9,
    width: 22,
    height: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fileRow: {
    minHeight: 70,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  fileIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: { flex: 1, marginHorizontal: 11, alignItems: "flex-end" },
  fileName: {
    fontSize: 14,
    fontWeight: "800",
    writingDirection: "rtl",
    textAlign: "right",
  },
  moreButton: { padding: 8 },
  rowCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionToolbar: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  selectionTitle: {
    color: "#FFF",
    fontWeight: "900",
    marginHorizontal: 8,
    writingDirection: "rtl",
  },
  toolbarActions: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  toolButton: {
    width: 39,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(4,13,20,0.42)",
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
  },
  grabber: {
    width: 42,
    height: 5,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    fontSize: 15,
    writingDirection: "rtl",
  },
  folderPreview: {
    marginTop: 13,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 72,
    paddingHorizontal: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
  },
  previewGlyphWrap: {
    width: 48,
    height: 45,
    position: "relative",
    paddingTop: 5,
  },
  previewTab: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 22,
    height: 12,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  previewGlyph: {
    width: 45,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTextWrap: { flex: 1, alignItems: "flex-end" },
  previewName: { fontWeight: "900", writingDirection: "rtl" },
  previewHint: { marginTop: 3, fontSize: 11, writingDirection: "rtl" },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 17,
    marginBottom: 9,
    writingDirection: "rtl",
    textAlign: "right",
  },
  optionRow: { flexDirection: "row-reverse", gap: 9, flexWrap: "wrap" },
  colorOption: { width: 31, height: 31, borderRadius: 16 },
  colorSelected: {
    borderColor: "#FFF",
    borderWidth: 3,
    transform: [{ scale: 1.12 }],
  },
  iconOption: {
    width: 43,
    height: 43,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeRow: { flexDirection: "row-reverse", gap: 8 },
  sizeOption: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeText: { fontSize: 12, fontWeight: "800", writingDirection: "rtl" },
  saveButton: {
    height: 53,
    borderRadius: 17,
    marginTop: 23,
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(4,13,20,0.42)",
  },
  dialog: { borderRadius: 24, padding: 20 },
  dialogActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 22,
    marginTop: 18,
  },
  textButton: { paddingVertical: 7 },
  textButtonText: { fontWeight: "900", fontSize: 14, writingDirection: "rtl" },
  moveRoot: {
    minHeight: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 9,
  },
  moveText: { fontSize: 14, fontWeight: "800", writingDirection: "rtl" },
});
