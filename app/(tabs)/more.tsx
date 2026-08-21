import { useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { formatBytes, useFileManager } from "@/lib/file-manager-store";
import { useFileTheme } from "@/lib/file-theme";
import { currentVersionCode, registerForPushNotifications, reportInstallationActivity } from "@/lib/app-updates";

export default function SettingsScreen() {
  const {
    preferences,
    updatePreferences,
    folders,
    files,
    totalStoredBytes,
    setPin,
    clearPin,
    lock,
  } = useFileManager();
  const { palette, background, isDark } = useFileTheme();
  const [pinModal, setPinModal] = useState(false);
  const changeNotifications = async (enabled: boolean) => {
    if (!enabled) {
      updatePreferences({ notificationsEnabled: false });
      await reportInstallationActivity({ versionCode: currentVersionCode(), notificationsAllowed: false });
      return;
    }
    const result = await registerForPushNotifications(true);
    if (!result.allowed) {
      const message =
        result.reason === "project_unconfigured"
          ? "إعداد الإشعارات الفورية غير مكتمل في هذه النسخة. سيتم إصلاحه في التحديث القادم."
          : result.reason === "token_unavailable"
            ? "تعذر تسجيل رمز الإشعار الآن. تحقق من اتصال الإنترنت ثم أعد المحاولة."
            : "لم تمنح الإذن للإشعارات. يمكنك تفعيله لاحقاً من إعدادات الهاتف.";
      await reportInstallationActivity({ versionCode: currentVersionCode(), notificationsAllowed: false });
      Alert.alert("الإشعارات", message);
      return;
    }
    updatePreferences({ notificationsEnabled: true });
    const synced = await reportInstallationActivity({ versionCode: currentVersionCode(), notificationsAllowed: true, expoPushToken: result.token });
    if (!synced) Alert.alert("الإشعارات", "تم إنشاء رمز الإشعار، لكن تعذر تسجيله في الموقع الآن. أعد المحاولة بعد التحقق من اتصال الإنترنت.");
  };
  return (
    <ScreenContainer className="px-5">
      <PinSheet
        visible={pinModal}
        onClose={() => setPinModal(false)}
        onSave={async (pin) => {
          await setPin(pin);
          setPinModal(false);
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { backgroundColor: background },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              تطبيق محاضراتي
            </Text>
            <Text style={[styles.title, { color: palette.text }]}>
              الإعدادات
            </Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: palette.soft }]}>
            <Icon name="cog-outline" color={palette.primary} size={24} />
          </View>
        </View>
        <View
          style={[
            styles.summary,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={[styles.summaryIcon, { backgroundColor: palette.soft }]}>
            <Icon name="harddisk" color={palette.primary} size={23} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryTitle, { color: palette.text }]}>
              {formatBytes(totalStoredBytes)} محفوظ محلياً
            </Text>
            <Text style={[styles.summaryText, { color: palette.muted }]}>
              {folders.filter((item) => !item.trashedAt).length} مجلد ·{" "}
              {files.filter((item) => !item.trashedAt).length} ملف
            </Text>
          </View>
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          المظهر
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Setting
            icon="theme-light-dark"
            title="الوضع الداكن"
            subtitle="تفعيل مظهر مريح للعين"
            right={
              <Switch
                value={isDark}
                onValueChange={(enabled) =>
                  updatePreferences({ theme: enabled ? "dark" : "light" })
                }
                trackColor={{ false: palette.border, true: palette.primary }}
                thumbColor="#FFF"
              />
            }
            palette={palette}
          />
          <Divider color={palette.border} />
          <Setting
            icon="image-filter-hdr-outline"
            title="خلفية التطبيق"
            subtitle="اختر الألوان المناسبة لك"
            right={
              <View style={styles.backgroundChoices}>
                {(["paper", "ocean", "violet", "sand"] as const).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => updatePreferences({ background: item })}
                    style={[
                      styles.bgDot,
                      {
                        backgroundColor:
                          item === "paper"
                            ? "#F7F8FA"
                            : item === "ocean"
                              ? "#8DD5FF"
                              : item === "violet"
                                ? "#BDA6FF"
                                : "#F2D393",
                        borderColor:
                          preferences.background === item
                            ? palette.text
                            : "transparent",
                      },
                    ]}
                  />
                ))}
              </View>
            }
            palette={palette}
          />
          <Divider color={palette.border} />
          <Setting
            icon="view-grid-outline"
            title="حجم عرض المجلدات"
            subtitle="صغير، متوسط أو كبير"
            right={
              <View style={styles.sizeChoices}>
                {(["small", "medium", "large"] as const).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() =>
                      updatePreferences({ defaultFolderSize: item })
                    }
                    style={[
                      styles.sizeDot,
                      {
                        borderColor:
                          preferences.defaultFolderSize === item
                            ? palette.primary
                            : palette.border,
                        backgroundColor:
                          preferences.defaultFolderSize === item
                            ? palette.soft
                            : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeDotText,
                        {
                          color:
                            preferences.defaultFolderSize === item
                              ? palette.primary
                              : palette.muted,
                        },
                      ]}
                    >
                      {item === "small" ? "ص" : item === "medium" ? "و" : "ك"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
            palette={palette}
          />
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>التحديثات والخصوصية</Text>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Setting
            icon="bell-outline"
            title="إشعارات التحديثات"
            subtitle={preferences.notificationsEnabled ? "ستصلك الإعلانات والتحديثات المهمة" : "اختر السماح لتلقي التنبيهات المهمة"}
            right={<Switch value={preferences.notificationsEnabled} onValueChange={changeNotifications} trackColor={{ false: palette.border, true: palette.primary }} thumbColor="#FFF" />}
            palette={palette}
          />
          <Divider color={palette.border} />
          <Setting
            icon="bell-badge-outline"
            title="مركز الإشعارات"
            subtitle="عرض الإعلانات والتنبيهات ورسائل التحديث"
            right={<Pressable onPress={() => router.push("/notifications")}><Icon name="chevron-left" color={palette.muted} size={22} /></Pressable>}
            palette={palette}
          />
          <Divider color={palette.border} />
          <Setting
            icon="chart-timeline-variant"
            title="مساعدة في تحسين التطبيق"
            subtitle="إرسال نشاط مجهول ورقم الإصدار فقط"
            right={<Switch value={preferences.analyticsEnabled} onValueChange={async (enabled) => { updatePreferences({ analyticsEnabled: enabled }); if (enabled) await reportInstallationActivity({ versionCode: currentVersionCode(), notificationsAllowed: preferences.notificationsEnabled }); }} trackColor={{ false: palette.border, true: palette.primary }} thumbColor="#FFF" />}
            palette={palette}
          />
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          الخصوصية
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Setting
            icon="shield-lock-outline"
            title="قفل التطبيق برمز PIN"
            subtitle={
              preferences.lockEnabled
                ? "القفل مفعّل"
                : "أضف رمزاً لحماية مكتبتك"
            }
            right={
              <Switch
                value={preferences.lockEnabled}
                onValueChange={(enabled) =>
                  enabled ? setPinModal(true) : clearPin()
                }
                trackColor={{ false: palette.border, true: palette.primary }}
                thumbColor="#FFF"
              />
            }
            palette={palette}
          />
          <Divider color={palette.border} />
          <Setting
            icon="fingerprint"
            title="فتح بالبصمة"
            subtitle="استخدم البصمة أو الوجه عند توفرهما"
            right={
              <Switch
                value={preferences.biometricEnabled}
                disabled={!preferences.lockEnabled}
                onValueChange={(enabled) =>
                  updatePreferences({ biometricEnabled: enabled })
                }
                trackColor={{ false: palette.border, true: palette.primary }}
                thumbColor="#FFF"
              />
            }
            palette={palette}
          />
          <Divider color={palette.border} />
          <Setting
            icon="lock-reset"
            title="قفل الآن"
            subtitle="إظهار شاشة PIN فوراً"
            right={
              <Pressable onPress={lock}>
                <Icon name="chevron-left" color={palette.muted} size={22} />
              </Pressable>
            }
            palette={palette}
          />
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(
              "محاضراتي",
              "مدير ملفات دراسي محلي ينظم مجلداتك وملفاتك داخل مساحة التطبيق.",
            )
          }
          style={styles.about}
        >
          <Icon name="information-outline" color={palette.muted} size={18} />
          <Text style={[styles.aboutText, { color: palette.muted }]}>
            حول تطبيق محاضراتي
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

function Setting({
  icon,
  title,
  subtitle,
  right,
  palette,
}: {
  icon: any;
  title: string;
  subtitle: string;
  right: React.ReactNode;
  palette: { primary: string; soft: string; text: string; muted: string };
}) {
  return (
    <View style={styles.setting}>
      <View style={[styles.settingIcon, { backgroundColor: palette.soft }]}>
        <Icon name={icon} color={palette.primary} size={21} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: palette.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingSub, { color: palette.muted }]}>
          {subtitle}
        </Text>
      </View>
      {right}
    </View>
  );
}
function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}
function PinSheet({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (pin: string) => Promise<void>;
}) {
  const { palette } = useFileTheme();
  const [pin, setPin] = useState("");
  const save = async () => {
    if (pin.length < 4)
      return Alert.alert("رمز قصير", "أدخل رمزاً من 4 إلى 6 أرقام.");
    await onSave(pin);
    setPin("");
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: palette.surface }]}>
          <Text style={[styles.modalTitle, { color: palette.text }]}>
            إنشاء رمز PIN
          </Text>
          <Text style={[styles.modalText, { color: palette.muted }]}>
            استخدم من 4 إلى 6 أرقام لحماية ملفاتك.
          </Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            autoFocus
            textAlign="center"
            placeholder="••••"
            placeholderTextColor={palette.muted}
            style={[
              styles.pinInput,
              {
                color: palette.text,
                borderColor: palette.border,
                backgroundColor: palette.background,
              },
            ]}
          />
          <View style={styles.modalActions}>
            <Pressable onPress={onClose}>
              <Text style={[styles.cancelText, { color: palette.muted }]}>
                إلغاء
              </Text>
            </Pressable>
            <Pressable onPress={save}>
              <Text style={[styles.savePin, { color: palette.primary }]}>
                حفظ الرمز
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
    writingDirection: "rtl",
    marginTop: 2,
  },
  iconBox: {
    width: 47,
    height: 47,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginTop: 18,
  },
  summaryIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCopy: { flex: 1, marginRight: 11, alignItems: "flex-end" },
  summaryTitle: { fontSize: 14, fontWeight: "900", writingDirection: "rtl" },
  summaryText: { fontSize: 11, marginTop: 3, writingDirection: "rtl" },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  setting: {
    minHeight: 73,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  settingCopy: { flex: 1, alignItems: "flex-end" },
  settingTitle: {
    fontSize: 14,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  settingSub: {
    fontSize: 10,
    marginTop: 3,
    writingDirection: "rtl",
    textAlign: "right",
  },
  divider: { height: 1, marginHorizontal: 14 },
  backgroundChoices: { flexDirection: "row-reverse", gap: 5 },
  bgDot: { width: 18, height: 18, borderRadius: 10, borderWidth: 2 },
  sizeChoices: { flexDirection: "row-reverse", gap: 4 },
  sizeDot: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeDotText: { fontSize: 10, fontWeight: "900" },
  about: {
    flexDirection: "row-reverse",
    alignSelf: "center",
    gap: 7,
    alignItems: "center",
    padding: 12,
    marginTop: 15,
  },
  aboutText: { fontSize: 12, writingDirection: "rtl" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(4,13,20,0.42)",
  },
  modal: { borderRadius: 24, padding: 21 },
  modalTitle: {
    fontSize: 19,
    fontWeight: "900",
    writingDirection: "rtl",
    textAlign: "right",
  },
  modalText: {
    fontSize: 12,
    marginTop: 6,
    writingDirection: "rtl",
    textAlign: "right",
  },
  pinInput: {
    height: 55,
    borderWidth: 1,
    borderRadius: 16,
    fontSize: 22,
    letterSpacing: 7,
    marginTop: 18,
  },
  modalActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 22,
    marginTop: 20,
  },
  cancelText: { fontWeight: "900", writingDirection: "rtl" },
  savePin: { fontWeight: "900", writingDirection: "rtl" },
});
