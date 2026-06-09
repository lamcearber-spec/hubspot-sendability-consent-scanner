export const HUBSPOT_AUTHORIZE_URL = "https://app.hubspot.com/oauth/authorize";
export const HUBSPOT_TOKEN_URL = "https://api.hubapi.com/oauth/v1/token";

export const REQUIRED_SCOPES = ["crm.objects.contacts.read", "forms"] as const;
export const OPTIONAL_SCOPES = ["communication_preferences.statuses.batch.read"] as const;

export type HubSpotTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: "bearer" | "Bearer" | string;
  scope?: string;
};

export function assertReadOnlyScopes(scopes: readonly string[]): void {
  const unsafe = scopes.find((scope) => scope.includes(".write") || scope === "oauth");
  if (unsafe) {
    throw new Error(`Unsafe HubSpot scope rejected: ${unsafe}`);
  }
}

export function buildInstallUrl(input: {
  clientId: string;
  redirectUri: string;
  state?: string;
  requiredScopes?: readonly string[];
  optionalScopes?: readonly string[];
}): string {
  const requiredScopes = input.requiredScopes ?? REQUIRED_SCOPES;
  const optionalScopes = input.optionalScopes ?? OPTIONAL_SCOPES;
  assertReadOnlyScopes([...requiredScopes, ...optionalScopes]);

  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    scope: requiredScopes.join(" ")
  });

  if (optionalScopes.length > 0) {
    params.set("optional_scope", optionalScopes.join(" "));
  }
  if (input.state) {
    params.set("state", input.state);
  }

  return `${HUBSPOT_AUTHORIZE_URL}?${params.toString()}`;
}

export function buildTokenExchangeRequest(input: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): { url: string; init: RequestInit } {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    client_secret: input.clientSecret,
    redirect_uri: input.redirectUri,
    code: input.code
  });

  return {
    url: HUBSPOT_TOKEN_URL,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  };
}
