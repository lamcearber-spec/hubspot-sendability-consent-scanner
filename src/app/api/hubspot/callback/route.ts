import { NextResponse } from "next/server";
import { buildTokenExchangeRequest, type HubSpotTokenResponse } from "@/lib/hubspot/oauth";
import { sessionCookieHeader } from "@/lib/hubspot/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing HubSpot authorization code." }, { status: 400 });
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  const appBaseUrl = process.env.APP_BASE_URL ?? requestUrl.origin;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "HubSpot OAuth environment variables are not configured." }, { status: 500 });
  }

  const tokenRequest = buildTokenExchangeRequest({
    clientId,
    clientSecret,
    redirectUri,
    code
  });
  const tokenResponse = await fetch(tokenRequest.url, tokenRequest.init);

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: "HubSpot token exchange failed." }, { status: 502 });
  }

  const token = (await tokenResponse.json()) as HubSpotTokenResponse;
  const response = NextResponse.redirect(`${appBaseUrl}/?connected=1`);
  response.headers.set("Set-Cookie", sessionCookieHeader(token, requestUrl.protocol === "https:"));

  return response;
}
