import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard, Icon, IconButton, palette, Pill, ProgressBar } from "@/components/app-ui";
import { courseProgress, useStudy, type Lecture } from "@/lib/study-store";
import { ScreenContainer } from "@/components/screen-container";

const typeMap: Record<Lecture["type"], { icon: "file-pdf-box" | "play-circle" | "headphones" | "file-document-outline"; label: string; color: string; bg: string }> = {
  pdf: { icon: "file-pdf-box", label: "PDF", color: "#C94D48", bg: "#FCE9E7" },
  video: { icon: "play-circle", label: "فيديو", color: "#6B59B7", bg: "#ECE9FB" },
  audio: { icon: "headphones", label: "صوت", color: "#287A83", bg: "#E2F4F5" },
  file: { icon: "file-document-outline", label: "ملف", color: "#48715A", bg: "#E5F2EA" },
};

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, toggleLecture, importFile } = useStudy();
  const course = courses.find((item) => item.id === id);

  if (!course) return <ScreenContainer style={styles.empty}><Text style={styles.emptyTitle}>لم نعثر على هذا المقرر</Text><Pressable onPress={() => router.back()}><Text style={styles.backLink}>العودة إلى مكتبتي</Text></Pressable></ScreenContainer>;
  const progress = courseProgress(course);
  const done = course.lectures.filter((lecture) => lecture.completed).length;

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "video/*", "audio/*", "text/*"], copyToCacheDirectory: true });
    if (!result.canceled) importFile(course.id, result.assets[0]);
  };

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-5" containerClassName="bg-[#F7F8FA]">
    <FlatList
      data={course.lectures}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<>
        <View style={styles.topbar}><IconButton name="arrow-right" label="رجوع" onPress={() => router.back()} /><View style={styles.topActions}><IconButton name="dots-horizontal" label="المزيد" onPress={() => {}} /><IconButton name="paperclip" label="استيراد ملف" onPress={handleImport} tone="primary" /></View></View>
        <View style={[styles.hero, { backgroundColor: course.color }]}>
          <View style={styles.heroIcon}><Icon name={course.icon as any} size={32} color={course.color} /></View>
          <View style={styles.heroText}><Text style={styles.heroCode}>{course.code}</Text><Text style={styles.heroTitle}>{course.title}</Text><Text style={styles.heroTeacher}>{course.lecturer}</Text></View>
        </View>
        <AppCard style={styles.progressCard}>
          <View style={styles.progressTop}><View><Text style={styles.progressNumber}>{progress}%</Text><Text style={styles.progressLabel}>مكتمل حتى الآن</Text></View><Pill label={`${done} من ${course.lectures.length} محاضرات`} icon="check-circle" color={palette.mint} background="#E7F5ED" /></View>
          <ProgressBar value={progress} color={course.color} />
        </AppCard>
        <View style={styles.listHeader}><Text style={styles.listTitle}>محتوى المقرر</Text><Pressable onPress={handleImport} style={({ pressed }) => pressed && { opacity: 0.65 }}><Text style={styles.importText}>إضافة ملف</Text></Pressable></View>
      </>}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const meta = typeMap[item.type];
        return <Pressable onPress={() => toggleLecture(course.id, item.id)} style={({ pressed }) => [styles.lecture, pressed && { opacity: 0.76 }]}>
          <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}><Icon name={meta.icon} size={24} color={meta.color} /></View>
          <View style={styles.lectureBody}><View style={styles.lectureTitleRow}><Text style={[styles.lectureTitle, item.completed && styles.completedText]} numberOfLines={1}>{item.title}</Text>{item.completed ? <Pill label="مكتملة" color={palette.mint} background="#E8F7EE" /> : null}</View><Text style={styles.lectureMeta}>{meta.label} · {item.duration} · {item.date}</Text></View>
          <View style={[styles.check, item.completed && { backgroundColor: palette.mint, borderColor: palette.mint }]}>{item.completed ? <Icon name="check" size={16} color="#FFF" /> : null}</View>
        </Pressable>;
      }}
      ListEmptyComponent={<View style={styles.emptyFiles}><Icon name="folder-open-outline" size={36} color="#A7B4BD" /><Text style={styles.emptyFilesTitle}>لا توجد ملفات بعد</Text><Text style={styles.emptyFilesText}>أضف أول ملف أو محاضرة إلى هذا المقرر.</Text></View>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  topbar: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingTop: 5, marginBottom: 16 },
  topActions: { flexDirection: "row-reverse", gap: 8 },
  hero: { minHeight: 156, borderRadius: 29, padding: 20, flexDirection: "row-reverse", alignItems: "flex-end", overflow: "hidden" },
  heroIcon: { alignItems: "center", justifyContent: "center", width: 64, height: 64, backgroundColor: "#FFF", borderRadius: 23 },
  heroText: { flex: 1, marginRight: 14, alignItems: "flex-end" },
  heroCode: { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "800" },
  heroTitle: { color: "#FFF", fontSize: 25, lineHeight: 32, fontWeight: "900", writingDirection: "rtl", textAlign: "right", marginTop: 4 },
  heroTeacher: { color: "rgba(255,255,255,0.76)", fontSize: 12, marginTop: 5, writingDirection: "rtl" },
  progressCard: { marginTop: 14, padding: 16 },
  progressTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 13 },
  progressNumber: { color: palette.ink, fontWeight: "900", fontSize: 22, textAlign: "right" },
  progressLabel: { color: palette.muted, fontSize: 12, marginTop: 1, writingDirection: "rtl" },
  listHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 10 },
  listTitle: { color: palette.ink, fontSize: 18, fontWeight: "900", writingDirection: "rtl" },
  importText: { color: palette.sky, fontSize: 13, fontWeight: "800", writingDirection: "rtl" },
  listContent: { paddingBottom: 30 },
  lecture: { flexDirection: "row-reverse", alignItems: "center", paddingVertical: 13, borderBottomColor: "#E6EBEF", borderBottomWidth: 1 },
  typeIcon: { width: 45, height: 45, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  lectureBody: { flex: 1, marginRight: 11 },
  lectureTitleRow: { flexDirection: "row-reverse", alignItems: "center", gap: 7 },
  lectureTitle: { flexShrink: 1, color: palette.ink, fontWeight: "800", fontSize: 14, writingDirection: "rtl", textAlign: "right" },
  completedText: { color: "#7A8790", textDecorationLine: "line-through" },
  lectureMeta: { color: palette.muted, fontSize: 11, marginTop: 5, writingDirection: "rtl", textAlign: "right" },
  check: { width: 24, height: 24, borderRadius: 99, borderWidth: 1.5, borderColor: "#CBD5DB", alignItems: "center", justifyContent: "center", marginRight: 9 },
  empty: { alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { color: palette.ink, fontSize: 18, fontWeight: "800", writingDirection: "rtl" },
  backLink: { color: palette.sky, fontWeight: "800", writingDirection: "rtl" },
  emptyFiles: { alignItems: "center", paddingTop: 35 },
  emptyFilesTitle: { color: palette.ink, fontSize: 16, fontWeight: "800", marginTop: 10, writingDirection: "rtl" },
  emptyFilesText: { color: palette.muted, fontSize: 13, marginTop: 5, writingDirection: "rtl" },
});
