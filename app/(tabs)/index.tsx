import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppCard, Icon, IconButton, palette, Pill, ProgressBar, SectionTitle } from "@/components/app-ui";
import { NewNoteSheet } from "@/components/new-note-sheet";
import { ScreenContainer } from "@/components/screen-container";
import { courseProgress, useStudy } from "@/lib/study-store";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const { courses, notes, addNote } = useStudy();
  const [noteSheet, setNoteSheet] = useState(false);
  const allLectures = courses.flatMap((course) => course.lectures.map((lecture) => ({ ...lecture, course })));
  const completed = allLectures.filter((lecture) => lecture.completed).length;
  const next = allLectures.find((lecture) => !lecture.completed) ?? allLectures[0];
  const weeklyProgress = allLectures.length ? Math.round((completed / allLectures.length) * 100) : 0;
  return <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
    <NewNoteSheet visible={noteSheet} onClose={() => setNoteSheet(false)} onSave={(title, body) => addNote({ title, body })} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.topbar}><IconButton name="bell-outline" label="التنبيهات" onPress={() => router.push("/more" as any)} /><View style={styles.brand}><View style={styles.logo}><Icon name="book-open-page-variant" size={21} color="#FFF" /></View><View><Text style={styles.brandKicker}>رفيقك الدراسي</Text><Text style={styles.brandTitle}>محاضراتي <Text style={{ color: palette.sky }}>نوفا</Text></Text></View></View></View>
      <View style={styles.greeting}><Text style={styles.greetingSmall}>صباح التركيز،</Text><Text style={styles.greetingName}>جاهز لإنجاز جديد؟</Text></View>
      <View style={styles.weekCard}><View style={styles.weekTop}><View><Text style={styles.weekTitle}>تقدّمك هذا الأسبوع</Text><Text style={styles.weekSub}>واصل، بقي القليل على هدفك</Text></View><View style={styles.weekRing}><Text style={styles.weekPercent}>{weeklyProgress}%</Text></View></View><ProgressBar value={weeklyProgress} color="#FFF" track="rgba(255,255,255,0.22)" /><View style={styles.weekBottom}><Text style={styles.weekBottomText}>أنجزت {completed} من {allLectures.length} محاضرات</Text><Pill label="أسبوع منتج" icon="creation" color="#73530E" background="#FCE5A8" /></View></View>
      <SectionTitle title="التالي في خطتك" action="عرض الخطة" onAction={() => router.push("/library" as any)} />
      {next ? <Pressable onPress={() => router.push({ pathname: "/course/[id]", params: { id: next.course.id } } as any)} style={({ pressed }) => [styles.nextCard, pressed && { opacity: 0.78 }]}><View style={[styles.nextIcon, { backgroundColor: next.course.accent }]}><Icon name="play" size={25} color={next.course.color} /></View><View style={styles.nextBody}><Pill label={next.course.title} color={next.course.color} background={next.course.accent} /><Text numberOfLines={1} style={styles.nextTitle}>{next.title}</Text><Text style={styles.nextMeta}>{next.duration} · {next.course.code}</Text></View><Icon name="chevron-left" size={24} color="#83919A" /></Pressable> : null}
      <SectionTitle title="مقرراتك الأخيرة" action="كل المقررات" onAction={() => router.push("/library" as any)} />
      <View style={styles.courseGrid}>{courses.slice(0, 3).map((course) => <Pressable key={course.id} onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } } as any)} style={({ pressed }) => [styles.courseTile, pressed && { opacity: 0.75 }]}><View style={[styles.courseCircle, { backgroundColor: course.accent }]}><Icon name={course.icon as any} size={24} color={course.color} /></View><Text numberOfLines={1} style={styles.courseTitle}>{course.title}</Text><Text style={styles.courseCode}>{course.code}</Text><ProgressBar value={courseProgress(course)} color={course.color} /><Text style={[styles.coursePercent, { color: course.color }]}>{courseProgress(course)}% مكتمل</Text></Pressable>)}</View>
      <SectionTitle title="لمحة سريعة" />
      <AppCard style={styles.noteCard}><View style={styles.noteIcon}><Icon name="lightbulb-on-outline" size={23} color="#A77012" /></View><View style={styles.noteCopy}><Text style={styles.noteTitle}>فكرة اليوم</Text><Text numberOfLines={2} style={styles.noteBody}>{notes[0]?.body ?? "أضف ملاحظة سريعة لتحافظ على أفكارك المهمة."}</Text></View><Pressable onPress={() => setNoteSheet(true)} style={({ pressed }) => [styles.noteAdd, pressed && { opacity: 0.65 }]}><Icon name="plus" size={20} color={palette.navy} /></Pressable></AppCard>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 }, topbar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingTop: 5 }, brand: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, logo: { width: 39, height: 39, borderRadius: 14, backgroundColor: palette.navy, alignItems: "center", justifyContent: "center" }, brandKicker: { color: palette.muted, fontSize: 10, fontWeight: "700", textAlign: "right", writingDirection: "rtl" }, brandTitle: { color: palette.ink, fontSize: 16, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  greeting: { alignItems: "flex-end", marginTop: 24 }, greetingSmall: { color: palette.muted, fontSize: 14, writingDirection: "rtl" }, greetingName: { color: palette.ink, fontSize: 26, lineHeight: 34, fontWeight: "900", writingDirection: "rtl" },
  weekCard: { backgroundColor: palette.navy, borderRadius: 28, padding: 18, marginTop: 17 }, weekTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, weekTitle: { color: "#FFF", fontSize: 17, fontWeight: "900", writingDirection: "rtl" }, weekSub: { color: "#BDCCE0", fontSize: 12, marginTop: 3, writingDirection: "rtl" }, weekRing: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.20)" }, weekPercent: { color: "#FFF", fontWeight: "900", fontSize: 15 }, weekBottom: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 12 }, weekBottomText: { color: "#C3D2E5", fontSize: 11, writingDirection: "rtl" },
  nextCard: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: "#FFF", borderRadius: 24, borderWidth: 1, borderColor: "#E7ECF0", padding: 14, gap: 11, shadowColor: "#16374E", shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }, nextIcon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" }, nextBody: { flex: 1, alignItems: "flex-end" }, nextTitle: { color: palette.ink, fontSize: 15, fontWeight: "900", textAlign: "right", writingDirection: "rtl", marginTop: 7 }, nextMeta: { color: palette.muted, fontSize: 11, marginTop: 4, writingDirection: "rtl" },
  courseGrid: { flexDirection: "row-reverse", gap: 9 }, courseTile: { flex: 1, minHeight: 151, backgroundColor: "#FFF", padding: 12, borderRadius: 22, borderWidth: 1, borderColor: "#E7ECF0" }, courseCircle: { width: 39, height: 39, borderRadius: 14, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }, courseTitle: { color: palette.ink, fontSize: 13, fontWeight: "900", textAlign: "right", writingDirection: "rtl", marginTop: 12 }, courseCode: { color: palette.muted, fontSize: 10, textAlign: "right", marginTop: 3 }, coursePercent: { fontSize: 10, fontWeight: "900", textAlign: "right", marginTop: 7, writingDirection: "rtl" },
  noteCard: { flexDirection: "row-reverse", alignItems: "center", gap: 10, padding: 13 }, noteIcon: { width: 42, height: 42, backgroundColor: "#FFF3D7", borderRadius: 15, alignItems: "center", justifyContent: "center" }, noteCopy: { flex: 1, alignItems: "flex-end" }, noteTitle: { color: palette.ink, fontSize: 13, fontWeight: "900", writingDirection: "rtl" }, noteBody: { color: palette.muted, fontSize: 11, lineHeight: 17, textAlign: "right", writingDirection: "rtl", marginTop: 3 }, noteAdd: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#EDF5FC", alignItems: "center", justifyContent: "center" },
});
