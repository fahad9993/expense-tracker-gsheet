import { StatusBar } from "expo-status-bar";
import { useContext } from "react";

import AuthContextProvider, { AuthContext } from "@/context/AuthContext";
import { Stack } from "expo-router/stack";

function AuthStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

function AuthenticatedStack() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function Layout() {
  const authCtx = useContext(AuthContext);

  return (
    <>
      <StatusBar style="dark" />
      {!authCtx.isAuthenticated ? <AuthStack /> : <AuthenticatedStack />}
    </>
  );
}

// ✅ Wrap everything at the root level
export default function RootLayout() {
  return (
    <AuthContextProvider>
      <Layout />
    </AuthContextProvider>
  );
}
