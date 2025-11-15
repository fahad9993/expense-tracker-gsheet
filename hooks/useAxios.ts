import { useContext } from "react";
import axios from "axios";

import { BASE_URL } from "@/api/apiConfig";
import { isTokenExpired, refreshAccessToken } from "@/utils/auth";
import { AuthContext } from "@/context/AuthContext";

export const useAxios = () => {
  const { authenticate, logout, accessToken, refreshToken } =
    useContext(AuthContext);

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
  });

  api.interceptors.request.use(
    async (config) => {
      let token = accessToken;
      const refToken = refreshToken;

      if (token && isTokenExpired(token)) {
        if (refToken && !isTokenExpired(refToken)) {
          const newAccessToken = await refreshAccessToken(refToken);
          if (newAccessToken) {
            authenticate(newAccessToken, refToken);
          } else {
            logout();
          }
        } else {
          logout();
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
