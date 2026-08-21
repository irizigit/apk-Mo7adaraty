import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, palette } from "./app-ui";

export function NewCourseSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (title: string, code: string) => void }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const save = () => { onSave(title, code); setTitle(""); setCode(""); onClose(); };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.header}><Text style={styles.title}>مقرر جديد</Text><Pressable onPress={onClose} style={styles.close}><Icon name="close" size={20} /></Pressable></View>
        <TextInput value={title} onChangeText={setTitle} placeholder="اسم المقرر" placeholderTextColor="#9AA6AF" style={styles.input} textAlign="right" />
        <TextInput value={code} onChangeText={setCode} placeholder="رمز المقرر، مثال: CS 101" placeholderTextColor="#9AA6AF" style={styles.input} textAlign="right" autoCapitalize="characters" />
        <Pressable onPress={save} style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}><Icon name="plus" color="#FFF" size={20} /><Text style={styles.saveText}>إضافة إلى مكتبتي</Text></Pressable>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,33,43,0.28)" },
  sheet: { backgroundColor: "#FFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 34 },
  grabber: { width: 42, height: 5, backgroundColor: "#DEE5E9", borderRadius: 20, alignSelf: "center", marginBottom: 18 },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { color: palette.ink, fontSize: 20, fontWeight: "800", writingDirection: "rtl" },
  close: { width: 36, height: 36, borderRadius: 13, backgroundColor: "#F2F5F7", alignItems: "center", justifyContent: "center" },
  input: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: "#E3E9ED", backgroundColor: "#FAFBFC", paddingHorizontal: 15, color: palette.ink, fontSize: 15, marginBottom: 12, writingDirection: "rtl" },
  save: { height: 54, borderRadius: 17, backgroundColor: palette.navy, flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 },
  saveText: { color: "#FFF", fontWeight: "800", fontSize: 15, writingDirection: "rtl" },
});
