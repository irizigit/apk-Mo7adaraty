import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Platform } from "react-native";
import { useFileTheme } from "@/lib/file-theme";

export default function TabLayout() {
  const { palette } = useFileTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={23}
              name="home-variant-outline"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "مكتبتي",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={23}
              name="folder-multiple-outline"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "المفضلة",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={23}
              name="star-outline"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={23}
              name="cog-outline"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
