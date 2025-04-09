import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";

import AuthContextProvider, { AuthContext } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTokens = async () => {
      const storedAccessToken = await AsyncStorage.getItem("accessToken");
      const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
      console.log("storedAccessToken", storedAccessToken);
      console.log("storedRefreshToken", storedRefreshToken);

      if (
        storedAccessToken &&
        storedRefreshToken &&
        !isTokenExpired(storedAccessToken) &&
        !isTokenExpired(storedRefreshToken)
      ) {
        authCtx.authenticate(storedAccessToken, storedRefreshToken);
      } else if (storedRefreshToken && !isTokenExpired(storedRefreshToken)) {
        const newAccess = await refreshAccessToken(storedRefreshToken);
        if (newAccess) {
          authCtx.authenticate(newAccess, storedRefreshToken);
        }
      } else {
        authCtx.logout();
      }

      setIsLoading(false);
    };

    loadTokens();
  }, []);

  function isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return Date.now() / 1000 > exp;
    } catch {
      return true;
    }
  }

  const refreshAccessToken = async (
    refreshToken: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        "https://expense-tracker-gsheet.onrender.com/refreshToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshToken }),
        }
      );

      if (!response.ok) throw new Error("Refresh failed");

      const { token: newAccessToken } = await response.json();

      return newAccessToken;
    } catch (err) {
      return null;
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <StatusBar style="dark" />
      {authCtx.isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
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
