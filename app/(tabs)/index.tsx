import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/app-ui";
import {
  FolderCard,
  FolderEditorSheet,
  ManagedFileRow,
} from "@/components/file-manager-ui";
import { ScreenContainer } from "@/components/screen-container";
import { formatBytes, useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export default function HomeScreen() {
  const { childFolders, files, importFiles, totalStoredBytes } =
    useFileManager();
  const { palette, background } = useFileTheme();
  const [newFolder, setNewFolder] = useState(false);
  const rootFolders = childFolders(null).slice(0, 4);
  const recentFiles = useMemo(
    () =>
      files
        .filter((file) => file.trashedAt === null)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 3),
    [files],
  );
  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) await importFiles(null, result.assets);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
      <FolderEditorSheet
        visible={newFolder}
        parentId={null}
        onClose={() => setNewFolder(false)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { backgroundColor: background },
        ]}
      >
        <View style={styles.topbar}>
          <Pressable
            onPress={() => router.push("/search" as any)}
            style={[
              styles.searchButton,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <Icon name="magnify" color={palette.muted} size={21} />
            <Text style={[styles.searchText, { color: palette.muted }]}>
              ابحث في ملفاتك
            </Text>
          </Pressable>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: palette.navy }]}>
              <Icon name="folder-multiple" size={21} color="#FFF" />
            </View>
            <View>
              <Text style={[styles.brandKicker, { color: palette.muted }]}>
                منظم ملفاتك الدراسي
              </Text>
              <Text style={[styles.brandTitle, { color: palette.text }]}>
                محاضراتي
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.greeting}>
          <Text style={[styles.greetingSmall, { color: palette.muted }]}>
            كل ملفاتك في مكان واحد،
          </Text>
          <Text style={[styles.greetingName, { color: palette.text }]}>
            ابدأ بتنظيم مكتبتك
          </Text>
        </View>
        <View style={[styles.storageCard, { backgroundColor: palette.navy }]}>
          <View style={styles.storageTop}>
            <View>
              <Text style={styles.storageTitle}>مساحة محاضراتي</Text>
              <Text style={styles.storageSub}>
                {formatBytes(totalStoredBytes)} من الملفات المحفوظة
              </Text>
            </View>
            <View style={styles.storageBadge}>
              <Icon name="harddisk" color="#FFF" size={24} />
            </View>
          </View>
          <View style={styles.storageActions}>
            <Pressable
              onPress={() => setNewFolder(true)}
              style={styles.storageAction}
            >
              <Icon name="folder-plus-outline" color="#FFF" size={20} />
              <Text style={styles.storageActionText}>مجلد جديد</Text>
            </Pressable>
            <View style={styles.storageDivider} />
            <Pressable onPress={pickFiles} style={styles.storageAction}>
              <Icon name="file-import-outline" color="#FFF" size={20} />
              <Text style={styles.storageActionText}>استيراد ملفات</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            مجلدات سريعة
          </Text>
          <Pressable onPress={() => router.push("/library" as any)}>
            <Text style={[styles.sectionAction, { color: palette.primary }]}>
              عرض الكل
            </Text>
          </Pressable>
        </View>
        {rootFolders.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.folderStrip}
          >
            {rootFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                count={0}
                onPress={() =>
                  router.push({
                    pathname: "/folder/[id]",
                    params: { id: folder.id },
                  } as any)
                }
                onLongPress={() => router.push("/library" as any)}
              />
            ))}
          </ScrollView>
        ) : (
          <Pressable
            onPress={() => setNewFolder(true)}
            style={[
              styles.emptyQuick,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <Icon
              name="folder-plus-outline"
              color={palette.primary}
              size={27}
            />
            <Text style={[styles.emptyQuickText, { color: palette.text }]}>
              أنشئ أول مجلد دراسي
            </Text>
          </Pressable>
        )}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            أضيفت حديثاً
          </Text>
          <Pressable onPress={() => router.push("/library" as any)}>
            <Text style={[styles.sectionAction, { color: palette.primary }]}>
              مكتبتي
            </Text>
          </Pressable>
        </View>
        <View
          style={[
            styles.recentCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          {recentFiles.length ? (
            recentFiles.map((file) => (
              <ManagedFileRow
                key={file.id}
                file={file}
                onPress={() => {}}
                onLongPress={() => router.push("/library" as any)}
                onMore={() => router.push("/library" as any)}
              />
            ))
          ) : (
            <View style={styles.emptyRecent}>
              <Icon
                name="file-upload-outline"
                color={palette.primary}
                size={31}
              />
              <Text style={[styles.emptyRecentTitle, { color: palette.text }]}>
                لا توجد ملفات بعد
              </Text>
              <Text style={[styles.emptyRecentText, { color: palette.muted }]}>
                استورد ملفاتك إلى مجلد أو إلى المكتبة الرئيسية.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 26 },
  topbar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
  },
  brand: { flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brandKicker: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  searchButton: {
    height: 39,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
  },
  searchText: { fontSize: 11, writingDirection: "rtl" },
  greeting: { alignItems: "flex-end", marginTop: 24 },
  greetingSmall: { fontSize: 13, writingDirection: "rtl" },
  greetingName: {
    fontSize: 25,
    lineHeight: 34,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  storageCard: { borderRadius: 28, padding: 18, marginTop: 17 },
  storageTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storageTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  storageSub: {
    color: "#C4D6E5",
    fontSize: 12,
    marginTop: 4,
    writingDirection: "rtl",
  },
  storageBadge: {
    width: 47,
    height: 47,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },
  storageActions: {
    flexDirection: "row-reverse",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    marginTop: 17,
    paddingTop: 14,
  },
  storageAction: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  storageActionText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    writingDirection: "rtl",
  },
  storageDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.16)" },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "900", writingDirection: "rtl" },
  sectionAction: { fontSize: 12, fontWeight: "900", writingDirection: "rtl" },
  folderStrip: { flexDirection: "row-reverse", gap: 10 },
  emptyQuick: {
    height: 105,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  emptyQuickText: { fontWeight: "800", writingDirection: "rtl" },
  recentCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 13 },
  emptyRecent: { alignItems: "center", paddingVertical: 30 },
  emptyRecentTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 9,
    writingDirection: "rtl",
  },
  emptyRecentText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    writingDirection: "rtl",
  },
});
