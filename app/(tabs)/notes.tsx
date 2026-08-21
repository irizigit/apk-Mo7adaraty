import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, IconButton, palette, Pill } from "@/components/app-ui";
import { NewNoteSheet } from "@/components/new-note-sheet";
import { ScreenContainer } from "@/components/screen-container";
import { useStudy, type Note } from "@/lib/study-store";

const toneMap = { blue: { bg: "#EAF5FF", line: "#CDE6FF", color: "#236CA8" }, gold: { bg: "#FFF6DF", line: "#F5DFAC", color: "#9A6711" }, mint: { bg: "#EAF7F0", line: "#CDEBDD", color: "#267956" } };

function NoteCard({ note, courseName, onPin, onDelete }: { note: Note; courseName?: string; onPin: () => void; onDelete: () => void }) {
  const tone = toneMap[note.tone];
  return <View style={[styles.note, { backgroundColor: tone.bg, borderColor: tone.line }]}>
    <View style={styles.noteHead}><View style={styles.noteActions}><Pressable onPress={onDelete} style={({ pressed }) => pressed && { opacity: 0.55 }}><Icon name="trash-can-outline" size={18} color="#9C6A67" /></Pressable><Pressable onPress={onPin} style={({ pressed }) => pressed && { opacity: 0.55 }}><Icon name={note.pinned ? "pin" : "pin-outline"} size={19} color={note.pinned ? tone.color : "#758690"} /></Pressable></View><Text style={[styles.noteTitle, { color: tone.color }]}>{note.title}</Text></View>
    <Text numberOfLines={3} style={styles.noteBody}>{note.body}</Text>
    <View style={styles.noteFoot}>{courseName ? <Pill label={courseName} color={tone.color} background="rgba(255,255,255,0.55)" /> : <View />}<Text style={styles.updated}>{note.updatedAt}</Text></View>
  </View>;
}

export default function NotesScreen() {
  const { notes, courses, addNote, deleteNote, togglePin } = useStudy();
  const [query, setQuery] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);
  const filtered = useMemo(() => notes.filter((note) => `${note.title} ${note.body}`.includes(query)), [notes, query]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned)), [filtered]);
  return <ScreenContainer className="px-5" containerClassName="bg-[#F7F8FA]">
    <NewNoteSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onSave={(title, body) => addNote({ title, body })} />
    <View style={styles.top}><View><Text style={styles.eyebrow}>مساحتك الخاصة</Text><Text style={styles.heading}>ملاحظاتك</Text></View><IconButton name="pencil-outline" label="ملاحظة جديدة" tone="primary" onPress={() => setSheetVisible(true)} /></View>
    <View style={styles.search}><Icon name="magnify" size={20} color="#87949D" /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث داخل ملاحظاتك" placeholderTextColor="#96A2AA" style={styles.searchInput} textAlign="right" /></View>
    <FlatList data={sorted} renderItem={({ item }) => <NoteCard note={item} courseName={courses.find((course) => course.id === item.courseId)?.title} onPin={() => togglePin(item.id)} onDelete={() => deleteNote(item.id)} />} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.empty}><Icon name="note-plus-outline" size={42} color="#A2B0B9" /><Text style={styles.emptyTitle}>لا توجد ملاحظات بعد</Text><Text style={styles.emptyText}>ابدأ بأول ملاحظة من زر القلم.</Text></View>} />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  top: { flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 6, marginBottom: 18 },
  eyebrow: { color: palette.sky, fontSize: 12, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  heading: { color: palette.ink, fontSize: 25, lineHeight: 31, fontWeight: "900", textAlign: "right", writingDirection: "rtl", marginTop: 1 },
  search: { height: 51, flexDirection: "row-reverse", alignItems: "center", borderRadius: 17, borderWidth: 1, borderColor: "#E4EAEE", backgroundColor: "#FFF", paddingHorizontal: 15, gap: 9 },
  searchInput: { flex: 1, color: palette.ink, fontSize: 14, writingDirection: "rtl" },
  list: { paddingVertical: 14, gap: 11, paddingBottom: 24 },
  note: { borderWidth: 1, borderRadius: 23, padding: 15 },
  noteHead: { flexDirection: "row-reverse", justifyContent: "space-between", gap: 10 },
  noteActions: { flexDirection: "row", gap: 13, alignItems: "center" },
  noteTitle: { flex: 1, textAlign: "right", fontSize: 16, fontWeight: "900", writingDirection: "rtl" },
  noteBody: { marginTop: 9, color: "#41515E", fontSize: 13, lineHeight: 21, textAlign: "right", writingDirection: "rtl" },
  noteFoot: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  updated: { color: "#81909A", fontSize: 11, writingDirection: "rtl" },
  empty: { alignItems: "center", paddingTop: 72 },
  emptyTitle: { marginTop: 12, color: palette.ink, fontWeight: "800", fontSize: 16, writingDirection: "rtl" },
  emptyText: { marginTop: 5, color: palette.muted, fontSize: 13, writingDirection: "rtl" },
});
