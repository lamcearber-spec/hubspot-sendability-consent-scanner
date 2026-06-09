# HubSpot Marketplace Submission

## URLs

- Production app URL: `https://hubspot-sendability-consent-scanner.vercel.app/`
- OAuth callback URL: `https://hubspot-sendability-consent-scanner.vercel.app/api/hubspot/callback`
- Privacy URL: `https://hubspot-sendability-consent-scanner.vercel.app/privacy`
- Terms URL: `https://hubspot-sendability-consent-scanner.vercel.app/terms`
- Support URL: `https://hubspot-sendability-consent-scanner.vercel.app/support`
- Setup guide URL: `https://hubspot-sendability-consent-scanner.vercel.app/setup`
- Logo source: `public/marketplace/logo.svg`

## HubSpot Registration

- Developer account: `Radom UG` (`148666587`)
- Project: `sendability-consent-scanner` (`202731473`)
- App ID: `42181310`
- Deployed HubSpot build: `#2`
- Listing status: blocked until HubSpot records at least three active, unique installs from unaffiliated production accounts.

## Listing Copy

- App name: `Sendability Consent Scanner for HubSpot`
- Category: `Marketing`
- Secondary category: `Compliance`
- Tagline: `Find consent, subscription, and bounce blocks before your HubSpot campaign fails.`
- Short description: `Read-only pre-send scan for HubSpot contacts blocked by subscription type, opt-out, hard bounce, quarantine, marketing-contact status, or form consent mismatch.`

Sendability Consent Scanner helps HubSpot marketing teams answer a painful pre-send question: why are these contacts not sendable? The app reads selected contacts, subscription definitions, communication preference statuses, and forms, then classifies contacts as deliverable or blocked with a specific reason.

The app is intentionally read-only. It never edits contacts, changes subscription status, sends email, updates forms, or stores contact records. Exports are generated on demand for the installing account.

## Keywords

`HubSpot sendability`, `HubSpot consent`, `deliverability`, `GDPR consent`, `subscription types`, `marketing contacts`, `hard bounce`, `HubSpot forms`, `opt out`, `email not sending`, `communication preferences`

## Pricing

- Free: 1 scan/month
- Pro: USD 39/month for weekly and pre-send scans
- Agency: USD 99/month for multi-portal evidence exports

## Scopes

Required:

- `oauth`
- `crm.objects.contacts.read`
- `forms`

Optional / Enterprise:

- `communication_preferences.statuses.batch.read`

## Reviewer Notes

The production app includes fixture mode so reviewers can inspect the dashboard before installing with live test data. Live scans are generated from the active OAuth session and do not persist contact rows.

If a reviewer portal does not include HubSpot access to the communication-preferences batch endpoints, the app surfaces a scope note and still shows the other available read-only checks.
