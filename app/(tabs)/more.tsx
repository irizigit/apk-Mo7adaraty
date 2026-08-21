import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { AppCard, Icon, palette, ProgressBar, SectionTitle } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { courseProgress, useStudy } from "@/lib/study-store";

export default function MoreScreen() {
  const { courses, notes } = useStudy();
  const [reminders, setReminders] = useState(true);
  const [lock, setLock] = useState(false);
  const total = useMemo(() => courses.reduce((sum, course) => sum + course.lectures.length, 0), [courses]);
  const completed = useMemo(() => courses.reduce((sum, course) => sum + course.lectures.filter((lecture) => lecture.completed).length, 0), [courses]);
  const overall = total ? Math.round((completed / total) * 100) : 0;
  return <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.top}><View style={styles.avatar}><Text style={styles.avatarText}>إ</Text></View><View><Text style={styles.eyebrow}>مساحتك الدراسية</Text><Text style={styles.heading}>المزيد</Text></View></View>
      <AppCard style={styles.statsCard}><View style={styles.statsHeader}><View><Text style={styles.statsTitle}>ملخص الفصل</Text><Text style={styles.statsText}>أنت تتابع {courses.length} مقررات بتركيز رائع</Text></View><View style={styles.circle}><Text style={styles.circleText}>{overall}%</Text></View></View><ProgressBar value={overall} color={palette.sky} /><View style={styles.numbers}><Text style={styles.numberText}>{completed} محاضرات مكتملة</Text><Text style={styles.numberText}>{notes.length} ملاحظات محفوظة</Text></View></AppCard>
      <SectionTitle title="تقدم المقررات" />
      <View style={styles.courseStats}>{courses.map((course) => <View key={course.id} style={styles.courseStat}><View style={[styles.dot, { backgroundColor: course.color }]} /><Text style={styles.courseStatTitle}>{course.title}</Text><Text style={[styles.courseStatPercent, { color: course.color }]}>{courseProgress(course)}%</Text></View>)}</View>
      <SectionTitle title="تفضيلات الدراسة" />
      <AppCard style={styles.settingsCard}><SettingRow icon="bell-outline" title="تذكير الدراسة اليومي" subtitle="كل مساء الساعة 8:00" right={<Switch value={reminders} onValueChange={setReminders} trackColor={{ false: "#DDE5E9", true: "#A9D5FC" }} thumbColor={reminders ? palette.sky : "#FFF"} />} /><Divider /><SettingRow icon="shield-lock-outline" title="قفل الملاحظات" subtitle="استخدم رمزاً لحماية المحتوى" right={<Switch value={lock} onValueChange={setLock} trackColor={{ false: "#DDE5E9", true: "#A9D5FC" }} thumbColor={lock ? palette.sky : "#FFF"} />} /><Divider /><SettingRow icon="cloud-outline" title="النسخ الاحتياطي" subtitle="سيتم تفعيله عند ربط خدمة تخزين" right={<Icon name="chevron-left" size={22} color="#87949D" />} onPress={() => Alert.alert("النسخ الاحتياطي", "هذه النسخة تعمل محلياً. يمكن إضافة النسخ السحابي في المرحلة التالية.")} /></AppCard>
      <Pressable onPress={() => Alert.alert("عن محاضراتي نوفا", "نسخة تجريبية بتجربة عربية مخصصة لإدارة الدراسة.")} style={({ pressed }) => [styles.about, pressed && { opacity: 0.65 }]}><Icon name="information-outline" size={19} color="#79909D" /><Text style={styles.aboutText}>حول محاضراتي نوفا</Text></Pressable>
    </ScrollView>
  </ScreenContainer>;
}

function SettingRow({ icon, title, subtitle, right, onPress }: { icon: any; title: string; subtitle: string; right: React.ReactNode; onPress?: () => void }) {
  return <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.65 }]}><View style={styles.settingIcon}><Icon name={icon} size={22} color={palette.navy} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingSubtitle}>{subtitle}</Text></View><View>{right}</View></Pressable>;
}
function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  content: { paddingBottom: 26 }, top: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "flex-start", gap: 12, paddingTop: 6 }, avatar: { width: 49, height: 49, borderRadius: 18, backgroundColor: palette.navy, alignItems: "center", justifyContent: "center" }, avatarText: { color: "#FFF", fontSize: 21, fontWeight: "900" }, eyebrow: { color: palette.sky, fontSize: 12, fontWeight: "900", textAlign: "right", writingDirection: "rtl" }, heading: { color: palette.ink, fontSize: 25, lineHeight: 31, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  statsCard: { marginTop: 19, padding: 17 }, statsHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, statsTitle: { color: palette.ink, fontSize: 16, fontWeight: "900", writingDirection: "rtl" }, statsText: { color: palette.muted, fontSize: 12, marginTop: 4, writingDirection: "rtl", textAlign: "right" }, circle: { width: 55, height: 55, borderRadius: 28, backgroundColor: "#EAF5FF", alignItems: "center", justifyContent: "center" }, circleText: { color: palette.sky, fontSize: 15, fontWeight: "900" }, numbers: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 13 }, numberText: { color: palette.muted, fontSize: 11, writingDirection: "rtl" },
  courseStats: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E7ECF0", borderRadius: 22, paddingHorizontal: 15 }, courseStat: { minHeight: 49, flexDirection: "row-reverse", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EDF0F2" }, dot: { width: 9, height: 9, borderRadius: 99, marginLeft: 9 }, courseStatTitle: { flex: 1, color: palette.ink, fontSize: 13, fontWeight: "800", writingDirection: "rtl", textAlign: "right" }, courseStatPercent: { fontSize: 13, fontWeight: "900" },
  settingsCard: { padding: 0, overflow: "hidden" }, settingRow: { minHeight: 74, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 15, gap: 11 }, settingIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#EDF5FC", alignItems: "center", justifyContent: "center" }, settingCopy: { flex: 1 }, settingTitle: { color: palette.ink, fontSize: 14, fontWeight: "900", writingDirection: "rtl", textAlign: "right" }, settingSubtitle: { color: palette.muted, fontSize: 11, marginTop: 3, writingDirection: "rtl", textAlign: "right" }, divider: { height: 1, backgroundColor: "#E9EDF0", marginHorizontal: 15 }, about: { alignSelf: "center", flexDirection: "row-reverse", gap: 7, marginTop: 22, padding: 8 }, aboutText: { color: "#79909D", fontSize: 12, writingDirection: "rtl" },
});
