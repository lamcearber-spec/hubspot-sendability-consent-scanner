import { describe, expect, it } from "vitest";
import { readAccessTokenFromCookie, SESSION_COOKIE, sessionCookieHeader } from "./session";

describe("HubSpot session cookie", () => {
  it("stores the access token in an HttpOnly short-lived cookie", () => {
    const header = sessionCookieHeader(
      {
        access_token: "access-token",
        expires_in: 3600,
        token_type: "bearer"
      },
      true
    );

    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(readAccessTokenFromCookie(`${SESSION_COOKIE}=${header.split("=")[1].split(";")[0]}`)).toBe("access-token");
  });
});
