import { useContext } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_URL } from "@/api/apiConfig";
import { isTokenExpired, refreshAccessToken } from "@/utils/auth";
import { AuthContext } from "@/context/AuthContext";

export const useAxios = () => {
  const { authenticate, logout } = useContext(AuthContext);

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
  });

  api.interceptors.request.use(
    async (config) => {
      let token = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!token || isTokenExpired(token)) {
        if (refreshToken && !isTokenExpired(refreshToken)) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            authenticate(newAccessToken, refreshToken);
          } else {
            logout();
            throw new Error("Session expired. Please login again.");
          }
        } else {
          logout();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return api;
};
