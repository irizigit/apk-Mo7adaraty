import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppCard, Icon, IconButton, palette, ProgressBar } from "@/components/app-ui";
import { NewCourseSheet } from "@/components/new-course-sheet";
import { ScreenContainer } from "@/components/screen-container";
import { courseProgress, useStudy, type Course } from "@/lib/study-store";

function CourseRow({ course }: { course: Course }) {
  const progress = courseProgress(course);
  return <Pressable onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } } as any)} style={({ pressed }) => [styles.coursePress, pressed && { opacity: 0.74 }]}>
    <AppCard style={styles.courseCard}>
      <View style={[styles.courseIcon, { backgroundColor: course.accent }]}><Icon name={course.icon as any} size={27} color={course.color} /></View>
      <View style={styles.courseMain}><View style={styles.titleLine}><Text style={styles.courseTitle}>{course.title}</Text><Icon name="chevron-left" size={20} color="#8D9AA3" /></View><Text style={styles.courseCode}>{course.code} · {course.lecturer}</Text><View style={styles.progressLine}><Text style={[styles.percent, { color: course.color }]}>{progress}%</Text><View style={styles.grow}><ProgressBar value={progress} color={course.color} /></View></View></View>
    </AppCard>
  </Pressable>;
}

export default function LibraryScreen() {
  const { courses, addCourse } = useStudy();
  const [query, setQuery] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);
  const filtered = useMemo(() => courses.filter((course) => `${course.title} ${course.code}`.toLowerCase().includes(query.toLowerCase())), [courses, query]);
  return <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
    <NewCourseSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onSave={addCourse} />
    <View style={styles.top}><View><Text style={styles.eyebrow}>مكتبتي الدراسية</Text><Text style={styles.heading}>كل مقرراتك في مكان واحد</Text></View><IconButton name="plus" label="إضافة مقرر" tone="primary" onPress={() => setSheetVisible(true)} /></View>
    <View style={styles.search}><Icon name="magnify" size={21} color="#87949D" /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث في مقرراتك وملفاتك" placeholderTextColor="#96A2AA" style={styles.searchInput} textAlign="right" /></View>
    <View style={styles.filters}><Pressable style={styles.activeFilter}><Text style={styles.activeFilterText}>المقررات</Text></Pressable><Pressable style={styles.filter}><Text style={styles.filterText}>الملفات</Text></Pressable><Pressable style={styles.filter}><Text style={styles.filterText}>المفضلة</Text></Pressable></View>
    <FlatList data={filtered} renderItem={({ item }) => <CourseRow course={item} />} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.empty}><Icon name="book-plus-outline" size={43} color="#A2B0B9" /><Text style={styles.emptyTitle}>لا توجد نتائج مطابقة</Text><Text style={styles.emptyText}>جرّب بحثاً آخر أو أضف مقرراً جديداً.</Text></View>} />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  top: { flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 6, marginBottom: 18 },
  eyebrow: { color: palette.sky, fontSize: 12, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  heading: { color: palette.ink, fontSize: 22, lineHeight: 30, fontWeight: "900", textAlign: "right", writingDirection: "rtl", marginTop: 2 },
  search: { height: 51, flexDirection: "row-reverse", alignItems: "center", borderRadius: 17, borderWidth: 1, borderColor: "#E4EAEE", backgroundColor: "#FFF", paddingHorizontal: 15, gap: 9 },
  searchInput: { flex: 1, color: palette.ink, fontSize: 14, writingDirection: "rtl" },
  filters: { flexDirection: "row-reverse", gap: 8, marginTop: 15, marginBottom: 10 },
  activeFilter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: palette.navy },
  activeFilterText: { color: "#FFF", fontSize: 12, fontWeight: "800", writingDirection: "rtl" },
  filter: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E4EAEE" },
  filterText: { color: palette.muted, fontSize: 12, fontWeight: "800", writingDirection: "rtl" },
  list: { paddingTop: 4, paddingBottom: 24 },
  coursePress: { marginTop: 11 },
  courseCard: { flexDirection: "row-reverse", alignItems: "center", padding: 14 },
  courseIcon: { width: 54, height: 54, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  courseMain: { flex: 1, marginRight: 13 },
  titleLine: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  courseTitle: { color: palette.ink, fontSize: 16, fontWeight: "900", writingDirection: "rtl" },
  courseCode: { color: palette.muted, fontSize: 11, marginTop: 4, writingDirection: "rtl", textAlign: "right" },
  progressLine: { flexDirection: "row-reverse", alignItems: "center", gap: 9, marginTop: 10 },
  percent: { fontWeight: "900", fontSize: 12, minWidth: 29, textAlign: "right" },
  grow: { flex: 1 },
  empty: { alignItems: "center", paddingTop: 70 },
  emptyTitle: { marginTop: 12, color: palette.ink, fontWeight: "800", fontSize: 16, writingDirection: "rtl" },
  emptyText: { marginTop: 5, color: palette.muted, fontSize: 13, writingDirection: "rtl" },
});
