import type { HubSpotTokenResponse } from "./oauth";

export const SESSION_COOKIE = "hssc_session";

export function encodeSession(token: HubSpotTokenResponse): string {
  const payload = {
    accessToken: token.access_token,
    scope: token.scope,
    expiresAt: Date.now() + Math.max(60, token.expires_in - 60) * 1000
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function readAccessTokenFromCookie(cookieHeader?: string | null): string | undefined {
  const value = parseCookie(cookieHeader ?? "")[SESSION_COOKIE];
  if (!value) {
    return undefined;
  }

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      accessToken?: string;
      expiresAt?: number;
    };
    if (!payload.accessToken || !payload.expiresAt || payload.expiresAt <= Date.now()) {
      return undefined;
    }
    return payload.accessToken;
  } catch {
    return undefined;
  }
}

export function sessionCookieHeader(token: HubSpotTokenResponse, secure: boolean): string {
  const maxAge = Math.max(60, token.expires_in - 60);
  const parts = [
    `${SESSION_COOKIE}=${encodeSession(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function parseCookie(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) {
          return [part, ""];
        }
        return [part.slice(0, index), part.slice(index + 1)];
      })
  );
}
