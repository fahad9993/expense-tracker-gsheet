import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import TabBar from "@/components/TabBar";

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
  {
    name: "logout",
    title: "Logout",
    icon: (color, size) => (
      <AntDesign name="logout" size={size} color={color} />
    ),
  },
];

export default function TabLayout() {
  return (
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
  );
}
