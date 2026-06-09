import { describe, expect, it } from "vitest";
import { assertReadOnlyScopes, buildInstallUrl, buildTokenExchangeRequest } from "./oauth";

describe("HubSpot OAuth helpers", () => {
  it("builds install URL with read-only required and optional scopes", () => {
    const url = new URL(
      buildInstallUrl({
        clientId: "client-123",
        redirectUri: "https://example.com/api/hubspot/callback",
        state: "state-123"
      })
    );

    expect(url.hostname).toBe("app.hubspot.com");
    expect(url.searchParams.get("scope")).toContain("oauth");
    expect(url.searchParams.get("scope")).toContain("crm.objects.contacts.read");
    expect(url.searchParams.get("optional_scope")).toContain("communication_preferences.statuses.batch.read");
  });

  it("rejects write scopes", () => {
    expect(() => assertReadOnlyScopes(["crm.objects.contacts.write"])).toThrow("Unsafe HubSpot scope");
  });

  it("allows HubSpot's OAuth install-grant scope", () => {
    expect(() => assertReadOnlyScopes(["oauth", "forms"])).not.toThrow();
  });

  it("uses form-encoded token exchange", () => {
    const request = buildTokenExchangeRequest({
      clientId: "client",
      clientSecret: "secret",
      redirectUri: "https://example.com/callback",
      code: "code"
    });

    expect(request.init.method).toBe("POST");
    expect(request.init.body).toBeInstanceOf(URLSearchParams);
  });
});
