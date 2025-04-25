import { Tabs, usePathname } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import TabBar from "@/components/TabBar";
import Header from "@/components/Header";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { Colors } from "@/utils/colors";

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
      <SafeAreaView style={{ flex: 1 }}>
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
      <StatusBar backgroundColor={Colors.primary} barStyle={"light-content"} />
    </SafeAreaProvider>
  );
}
