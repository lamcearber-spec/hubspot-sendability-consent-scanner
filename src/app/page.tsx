import { cookies } from "next/headers";
import { SendabilityDashboard } from "@/components/SendabilityDashboard";
import { scanHubSpotAccount } from "@/lib/hubspot/client";
import { buildInstallUrl } from "@/lib/hubspot/oauth";
import { readAccessTokenFromCookie } from "@/lib/hubspot/session";
import { demoReport } from "@/lib/sendability/fixtures";

export default async function Page() {
  const installUrl = buildOptionalInstallUrl();
  const cookieStore = await cookies();
  const accessToken = readAccessTokenFromCookie(cookieStore.toString());

  if (accessToken) {
    const report = await scanHubSpotAccount(accessToken);
    return <SendabilityDashboard report={report} installUrl={installUrl} mode="connected" />;
  }

  return <SendabilityDashboard report={demoReport} installUrl={installUrl} mode="fixture" />;
}

function buildOptionalInstallUrl(): string | undefined {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const appBaseUrl = process.env.APP_BASE_URL;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI ?? (appBaseUrl ? `${appBaseUrl}/api/hubspot/callback` : undefined);

  if (!clientId || !redirectUri) {
    return undefined;
  }

  return buildInstallUrl({
    clientId,
    redirectUri,
    state: "sendability-consent-scanner"
  });
}
