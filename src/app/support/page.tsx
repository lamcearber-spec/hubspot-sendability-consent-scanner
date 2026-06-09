import { InfoPage } from "@/components/InfoPage";

export default function SupportPage() {
  return (
    <InfoPage eyebrow="Support" title="Support">
      <p>
        For installation, billing, or scan questions, email support@konverter-pro.de. Include your HubSpot portal ID,
        the approximate scan time, and whether the issue concerns contacts, forms, or communication preferences.
      </p>
      <p>
        The app requests read-only scopes. If a portal does not have access to HubSpot communication-preferences batch
        read endpoints, the scan will show a scope note instead of failing silently.
      </p>
    </InfoPage>
  );
}
