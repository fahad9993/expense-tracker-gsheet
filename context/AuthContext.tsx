import { createContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { isTokenExpired, refreshAccessToken } from "@/utils/auth";

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
