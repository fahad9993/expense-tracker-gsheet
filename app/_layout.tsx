import { Stack } from "expo-router/stack";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ActivityIndicator } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

function MainNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator size="large" />; // Render a loading spinner or blank screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="index" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
