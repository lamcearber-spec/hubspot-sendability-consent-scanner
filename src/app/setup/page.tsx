import { InfoPage } from "@/components/InfoPage";

export default function SetupPage() {
  return (
    <InfoPage eyebrow="Setup guide" title="Install and Use">
      <ol>
        <li>Install the app from the HubSpot Marketplace and approve the read-only requested scopes.</li>
        <li>Open the dashboard and run a scan before a campaign or during a monthly hygiene review.</li>
        <li>Review blocked reasons, form subscription mismatches, and list coverage.</li>
        <li>Download the blocked contacts CSV or the evidence PDF for internal remediation.</li>
        <li>Disconnect the app from HubSpot settings when no longer needed.</li>
      </ol>
      <p>
        The app does not write to HubSpot. It never changes subscription status, marketing-contact status, forms, lists,
        or contact properties.
      </p>
    </InfoPage>
  );
}
