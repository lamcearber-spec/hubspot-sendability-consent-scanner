import { readAccessTokenFromCookie } from "@/lib/hubspot/session";
import { scanHubSpotAccount } from "@/lib/hubspot/client";
import { demoReport } from "@/lib/sendability/fixtures";
import { renderSendabilityPdf } from "@/lib/sendability/pdf";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const accessToken = readAccessTokenFromCookie(request.headers.get("cookie"));
  const report = accessToken ? await scanHubSpotAccount(accessToken) : demoReport;
  const pdf = await renderSendabilityPdf(report);

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="hubspot-sendability-evidence.pdf"`
    }
  });
}
