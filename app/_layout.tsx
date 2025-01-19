import { Stack } from "expo-router/stack";
import { AuthProvider, useAuth } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

function MainNavigator() {
  const { isLoggedIn } = useAuth();
  console.log("Login state: ", isLoggedIn);

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
