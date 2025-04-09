import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean | null;
  authenticate: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isAuthenticated: null,
  authenticate: () => {},
  logout: () => {},
  authFetch: async () => {
    throw new Error("authFetch not initialized");
  },
});

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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

  const authenticate = async (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsAuthenticated(true);
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
  };

  const logout = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    let token = accessToken;
    const refToken = refreshToken;

    if (!token || isTokenExpired(token)) {
      if (refToken) {
        const newAccessToken = await refreshAccessToken(refToken);
        if (!newAccessToken) {
          logout();
          throw new Error("Session expired");
        }

        // ✅ Update global state and local reference
        token = newAccessToken;
        authenticate(newAccessToken, refToken);
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
        isAuthenticated,
        authenticate,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
