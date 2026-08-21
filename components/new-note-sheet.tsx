import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Icon, palette } from "./app-ui";

export function NewNoteSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (title: string, body: string) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const save = () => {
    onSave(title, body);
    setTitle("");
    setBody("");
    onClose();
  };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.header}><Text style={styles.title}>ملاحظة جديدة</Text><Pressable onPress={onClose} style={styles.close}><Icon name="close" size={20} /></Pressable></View>
        <TextInput value={title} onChangeText={setTitle} placeholder="عنوان الملاحظة" placeholderTextColor="#9AA6AF" style={styles.input} textAlign="right" returnKeyType="next" />
        <TextInput value={body} onChangeText={setBody} placeholder="اكتب ملخصك أو أفكارك هنا..." placeholderTextColor="#9AA6AF" style={[styles.input, styles.body]} textAlign="right" multiline />
        <Pressable onPress={save} style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}><Icon name="check" color="#FFF" size={20} /><Text style={styles.saveText}>حفظ الملاحظة</Text></Pressable>
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
  input: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: "#E3E9ED", backgroundColor: "#FAFBFC", paddingHorizontal: 15, color: palette.ink, fontSize: 15, marginBottom: 12, writingDirection: "rtl" },
  body: { minHeight: 120, textAlignVertical: "top", paddingTop: 14 },
  save: { height: 54, borderRadius: 17, backgroundColor: palette.navy, flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 },
  saveText: { color: "#FFF", fontWeight: "800", fontSize: 15, writingDirection: "rtl" },
});
