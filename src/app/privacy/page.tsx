import { InfoPage } from "@/components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Privacy" title="Privacy Policy">
      <p>
        Sendability Consent Scanner for HubSpot is a read-only reporting app. It reads HubSpot contacts, subscription
        definitions, communication preference statuses, and forms only when an authorized user runs a scan.
      </p>
      <p>
        The app does not sell data, send marketing emails, update HubSpot records, or store contact records. Exports are
        generated on demand for the installing account. OAuth access is held in a short-lived HttpOnly browser session
        cookie for the active scan session.
      </p>
      <p>
        Support contact: support@konverter-pro.de. Controller/operator: Radom UG, Germany.
      </p>
    </InfoPage>
  );
}
