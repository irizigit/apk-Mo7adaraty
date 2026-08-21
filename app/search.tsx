import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "@/components/app-ui";
import { FolderCard, ManagedFileRow } from "@/components/file-manager-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export default function SearchScreen() {
  const { folders, files, childFolders, childFiles } = useFileManager();
  const { palette, background } = useFileTheme();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const matchedFolders = useMemo(
    () =>
      folders.filter(
        (item) =>
          item.trashedAt === null && item.name.toLowerCase().includes(term),
      ),
    [folders, term],
  );
  const matchedFiles = useMemo(
    () =>
      files.filter(
        (item) =>
          item.trashedAt === null && item.name.toLowerCase().includes(term),
      ),
    [files, term],
  );
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
          <Text style={[styles.title, { color: palette.text }]}>البحث</Text>
        </View>
        <View
          style={[
            styles.search,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Icon name="magnify" color={palette.primary} size={22} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="اسم الملف أو المجلد"
            placeholderTextColor={palette.muted}
            style={[styles.input, { color: palette.text }]}
            textAlign="right"
          />
        </View>
        <FlatList
          data={matchedFiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {term && matchedFolders.length ? (
                <>
                  <Text style={[styles.label, { color: palette.muted }]}>
                    مجلدات
                  </Text>
                  <View style={styles.grid}>
                    {matchedFolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        count={
                          childFolders(folder.id).length +
                          childFiles(folder.id).length
                        }
                        onPress={() =>
                          router.push({
                            pathname: "/folder/[id]",
                            params: { id: folder.id },
                          } as any)
                        }
                        onLongPress={() => {}}
                      />
                    ))}
                  </View>
                </>
              ) : null}
              {term && matchedFiles.length ? (
                <Text style={[styles.label, { color: palette.muted }]}>
                  ملفات
                </Text>
              ) : null}
            </>
          }
          renderItem={({ item }) => (
            <ManagedFileRow
              file={item}
              onPress={() => {}}
              onLongPress={() => {}}
              onMore={() => {}}
            />
          )}
          ListEmptyComponent={
            term ? (
              <View style={styles.empty}>
                <Icon
                  name="file-search-outline"
                  color={palette.primary}
                  size={46}
                />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  لا توجد نتائج
                </Text>
                <Text style={[styles.emptyText, { color: palette.muted }]}>
                  جرّب اسماً آخر أو تحقق من التهجئة.
                </Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Icon name="magnify" color={palette.primary} size={46} />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  ابحث في مكتبتك
                </Text>
                <Text style={[styles.emptyText, { color: palette.muted }]}>
                  يمكنك البحث باسم أي ملف أو مجلد في جميع المستويات.
                </Text>
              </View>
            )
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
    justifyContent: "space-between",
    alignItems: "center",
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
  title: { fontSize: 21, fontWeight: "900", writingDirection: "rtl" },
  search: {
    height: 53,
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15, writingDirection: "rtl" },
  list: { paddingBottom: 25 },
  label: {
    fontSize: 12,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
    marginTop: 19,
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
