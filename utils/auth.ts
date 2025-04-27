import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { BASE_URL } from "@/api/apiConfig";

/** Checks if a JWT token is expired */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() / 1000 > exp;
  } catch {
    return true;
  }
}

/** Tries to refresh access token using a refresh token */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await axios.post(`${BASE_URL}/auth/refreshToken`, {
      refreshToken,
    });
    return response.data.token;
  } catch (err) {
    return null;
  }
}
