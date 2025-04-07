import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  authenticate: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  authFetch: async () => {
    throw new Error("authFetch not initialized");
  },
});

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() / 1000 > exp;
  } catch {
    return true;
  }
}

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTokens = async () => {
      const storedAccessToken = await AsyncStorage.getItem("accessToken");
      const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

      if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
        setAccessToken(storedAccessToken);
      } else if (storedRefreshToken) {
        const newAccess = await refreshAccessToken(storedRefreshToken);
        if (newAccess) {
          setAccessToken(newAccess);
          await AsyncStorage.setItem("accessToken", newAccess);
        }
      }
    };

    loadTokens();
  }, []);

  const authenticate = async (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
  };

  const logout = async () => {
    setAccessToken(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    router.replace("/"); // Or login screen
  };

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
      await AsyncStorage.setItem("accessToken", newAccessToken);
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (err) {
      logout(); // Force logout if refresh fails
      return null;
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    let token = accessToken;
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!token || isTokenExpired(token)) {
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (!newAccessToken) {
          logout();
          throw new Error("Session expired");
        }

        // ✅ Update global state and local reference
        token = newAccessToken;
        setAccessToken(token); // ← your context updater
        await AsyncStorage.setItem("accessToken", token); // optional, for persistency
      } else {
        logout();
        throw new Error("No refresh token available");
      }
    }

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: !!accessToken,
        authenticate,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
