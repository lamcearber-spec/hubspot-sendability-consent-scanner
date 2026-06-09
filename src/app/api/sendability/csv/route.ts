import { readAccessTokenFromCookie } from "@/lib/hubspot/session";
import { scanHubSpotAccount } from "@/lib/hubspot/client";
import { toBlockedContactsCsv } from "@/lib/sendability/export";
import { demoReport } from "@/lib/sendability/fixtures";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const accessToken = readAccessTokenFromCookie(request.headers.get("cookie"));
  const report = accessToken ? await scanHubSpotAccount(accessToken) : demoReport;
  const csv = toBlockedContactsCsv(report);

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="hubspot-blocked-contacts.csv"`
    }
  });
}
