import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Pdf from "react-native-pdf";
import { router, useLocalSearchParams } from "expo-router";
import { Icon } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";

export default function FilePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { files, shareFile } = useFileManager();
  const { palette, background } = useFileTheme();
  const file = files.find((item) => item.id === id && item.trashedAt === null);

  if (!file) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Icon name="file-alert-outline" size={44} color={palette.primary} />
        <Text style={[styles.emptyTitle, { color: palette.text }]}>الملف غير متاح</Text>
      </ScreenContainer>
    );
  }

  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.extension.toLowerCase() === "pdf" || file.mimeType === "application/pdf";
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.full, { backgroundColor: background }]}> 
        <View style={[styles.header, { borderBottomColor: palette.border, backgroundColor: palette.surface }]}>
          <Pressable onPress={() => router.back()} style={styles.headerAction}>
            <Icon name="arrow-right" color={palette.text} size={23} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>{file.name}</Text>
          <Pressable onPress={() => shareFile(file)} style={styles.headerAction}>
            <Icon name="share-variant-outline" color={palette.primary} size={22} />
          </Pressable>
        </View>
        {isImage ? (
          <Image source={file.uri} style={styles.preview} contentFit="contain" transition={150} />
        ) : isPdf ? (
          <Pdf
            source={{ uri: file.uri, cache: true }}
            style={styles.preview}
            trustAllCerts={false}
            enablePaging={false}
            spacing={8}
          />
        ) : (
          <View style={styles.unsupported}>
            <View style={[styles.unsupportedIcon, { backgroundColor: palette.soft }]}>
              <Icon name="file-eye-outline" size={38} color={palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>المعاينة غير متاحة لهذا النوع</Text>
            <Text style={[styles.emptyText, { color: palette.muted }]}>يمكنك مشاركة الملف وفتحه في التطبيق المناسب.</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  header: { height: 62, borderBottomWidth: 1, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 8 },
  headerAction: { width: 45, height: 45, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontWeight: "900", fontSize: 14, writingDirection: "rtl" },
  preview: { flex: 1, width: "100%" },
  unsupported: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 35 },
  unsupportedIcon: { width: 82, height: 82, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "900", marginTop: 18, textAlign: "center", writingDirection: "rtl" },
  emptyText: { fontSize: 13, marginTop: 7, textAlign: "center", writingDirection: "rtl" },
});
