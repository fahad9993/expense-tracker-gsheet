import { jwtDecode } from "jwt-decode";

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
    const response = await fetch(
      "https://expense-tracker-gsheet.onrender.com/refreshToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) throw new Error("Refresh failed");

    const { token: newAccessToken } = await response.json();
    return newAccessToken;
  } catch (err) {
    return null;
  }
}
