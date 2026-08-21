import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={23} name="home-variant-outline" color={color} />,
        }}
      />
      <Tabs.Screen name="library" options={{ title: "مكتبتي", tabBarIcon: ({ color }) => <MaterialCommunityIcons size={23} name="bookshelf" color={color} /> }} />
      <Tabs.Screen name="notes" options={{ title: "ملاحظاتي", tabBarIcon: ({ color }) => <MaterialCommunityIcons size={23} name="notebook-outline" color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: "المزيد", tabBarIcon: ({ color }) => <MaterialCommunityIcons size={23} name="dots-grid" color={color} /> }} />
    </Tabs>
  );
}
