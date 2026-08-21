import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/app-ui";
import { FolderCard, ManagedFileRow } from "@/components/file-manager-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export default function FavoritesScreen() {
  const { folders, files, childFolders, childFiles, toggleFavorite } =
    useFileManager();
  const { palette, background } = useFileTheme();
  const favoriteFolders = folders.filter(
    (item) => item.isFavorite && item.trashedAt === null,
  );
  const favoriteFiles = files.filter(
    (item) => item.isFavorite && item.trashedAt === null,
  );
  return (
    <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
      <View style={[styles.full, { backgroundColor: background }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              وصول سريع
            </Text>
            <Text style={[styles.title, { color: palette.text }]}>المفضلة</Text>
          </View>
          <View style={[styles.starBadge, { backgroundColor: palette.soft }]}>
            <Icon name="star" color={palette.primary} size={23} />
          </View>
        </View>
        <FlatList
          data={favoriteFiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {favoriteFolders.length ? (
                <>
                  <Text style={[styles.label, { color: palette.muted }]}>
                    مجلدات
                  </Text>
                  <View style={styles.grid}>
                    {favoriteFolders.map((folder) => (
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
                        onLongPress={() => toggleFavorite(folder.id, "folder")}
                      />
                    ))}
                  </View>
                </>
              ) : null}
              {favoriteFiles.length ? (
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
              onLongPress={() => toggleFavorite(item.id, "file")}
              onMore={() => toggleFavorite(item.id, "file")}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="star-outline" color={palette.primary} size={50} />
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                لا توجد عناصر مفضلة
              </Text>
              <Text style={[styles.emptyText, { color: palette.muted }]}>
                اضغط مطولاً على ملف أو مجلد ثم اختر رمز النجمة للوصول إليه
                بسرعة.
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
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "900",
    writingDirection: "rtl",
    marginTop: 2,
  },
  starBadge: {
    width: 45,
    height: 45,
    borderRadius: 16,
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
  empty: { alignItems: "center", paddingTop: 90, paddingHorizontal: 33 },
  emptyTitle: {
    marginTop: 13,
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
});
