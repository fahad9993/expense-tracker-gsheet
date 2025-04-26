import { StatusBar } from "react-native";
import { Tabs, usePathname } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import TabBar from "@/components/TabBar";
import Header from "@/components/Header";
import { Colors } from "@/utils/colors";
import toastConfig from "@/utils/toastConfig";

const tabs: {
  name: string;
  title: string;
  icon: (color: string, size: number) => JSX.Element;
}[] = [
  {
    name: "dashboard",
    title: "Home",
    icon: (color, size) => (
      <MaterialIcons name="dashboard" size={size} color={color} />
    ),
  },
  {
    name: "home",
    title: "Cash",
    icon: (color, size) => (
      <FontAwesome name="home" size={size} color={color} />
    ),
  },
  {
    name: "journal",
    title: "Journal",
    icon: (color, size) => <AntDesign name="form" size={size} color={color} />,
  },
];

export default function TabLayout() {
  const path = usePathname(); // Get current route info

  // Find the current tab title based on the route name
  const currentTab = tabs.find((tab) => tab.name === path.split("/")[1]);
  const headerTitle = currentTab ? currentTab.title : "App Title"; // Fallback if no match
  return (
    <SafeAreaProvider>
      <>
        <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
          <Header title={headerTitle} />
          <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{ headerShown: false }}
          >
            {tabs.map(({ name, title, icon }) => (
              <Tabs.Screen
                key={name}
                name={name}
                options={{
                  title,
                  tabBarIcon: ({ color, size }) => icon(color, size),
                }}
              />
            ))}
          </Tabs>
        </SafeAreaView>
        <Toast config={toastConfig} />
      </>
    </SafeAreaProvider>
  );
}
