import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoadingScreen from "@/components/LoadingScreen";
import AuthContextProvider, { AuthContext } from "@/context/AuthContext";
import { isTokenExpired, refreshAccessToken } from "@/utils/auth";

function Layout() {
  const authCtx = useContext(AuthContext);
  const router = useRouter();

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
        } else {
          authCtx.logout();
        }
      } else {
        authCtx.logout();
      }
    };

    loadTokens();
  }, []);

  useEffect(() => {
    if (authCtx.isAuthenticated === true) {
      router.replace("/home");
    } else if (authCtx.isAuthenticated === false) {
      router.replace("/");
    }
  }, [authCtx.isAuthenticated]);

  if (authCtx.isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
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
