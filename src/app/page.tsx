import { SendabilityDashboard } from "@/components/SendabilityDashboard";
import { buildInstallUrl } from "@/lib/hubspot/oauth";
import { demoReport } from "@/lib/sendability/fixtures";

export default function Page() {
  const installUrl = buildOptionalInstallUrl();

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
