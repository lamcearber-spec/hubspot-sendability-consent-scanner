import { InfoPage } from "@/components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage eyebrow="Terms" title="Terms of Service">
      <p>
        Sendability Consent Scanner for HubSpot provides operational reporting for consent and deliverability review. It
        is not legal advice and does not certify compliance with GDPR, CAN-SPAM, or any other law.
      </p>
      <p>
        Users are responsible for reviewing exported evidence with their legal, compliance, or marketing operations team.
        The app is provided as a read-only tool and will not write to or alter the connected HubSpot portal.
      </p>
      <p>
        Support contact: support@konverter-pro.de.
      </p>
    </InfoPage>
  );
}
