import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Tabs, useRouter } from "expo-router";

export default function TabLayout() {
  const router = useRouter(); // Access router for navigation
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "green" }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign size={24} name="form" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: "Logout",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign size={24} name="logout" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
