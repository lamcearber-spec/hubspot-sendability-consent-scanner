# HubSpot Friendly Install Kit

Use this kit to clear HubSpot's Marketplace eligibility gate for `Sendability Consent Scanner for HubSpot`.

## Current Blocker

HubSpot requires at least three active, unique installs from unaffiliated production HubSpot accounts with successful app activity in the last 30 days before the Marketplace listing can be created.

Do not use fake portals, Radom-owned portals, developer test accounts, sandbox accounts, duplicate accounts, or newly created accounts that do not represent a real business use case.

## Links

- Live app: `https://hubspot-sendability-consent-scanner.vercel.app/`
- Direct install link: `https://app.hubspot.com/oauth/authorize?client_id=035ceb82-6076-4dba-8ff4-9dff7bc639e4&redirect_uri=https%3A%2F%2Fhubspot-sendability-consent-scanner.vercel.app%2Fapi%2Fhubspot%2Fcallback&scope=oauth+crm.objects.contacts.read+forms&optional_scope=communication_preferences.statuses.batch.read&state=sendability-consent-scanner`
- Setup guide: `https://hubspot-sendability-consent-scanner.vercel.app/setup`
- Privacy: `https://hubspot-sendability-consent-scanner.vercel.app/privacy`
- Support: `https://hubspot-sendability-consent-scanner.vercel.app/support`

## Who Qualifies

- A real HubSpot production portal operated by someone unaffiliated with Radom UG, Konverter Pro, or the app developer account.
- The portal owner/admin can approve read-only OAuth access.
- The portal should stay installed until HubSpot recognizes the eligibility gate and the Marketplace listing is submitted.

## What The Tester Does

1. Sign in to the qualifying HubSpot production portal.
2. Open the direct install link above.
3. Select the portal and approve the read-only scopes.
4. After redirect, confirm the dashboard says `Connected scan`.
5. Click `Blocked CSV` and `Evidence PDF` once to create successful app activity.
6. Send back only a simple confirmation: portal name or ID, install date/time, and whether both exports opened.

The tester should not send contact exports or private CRM data back to Radom unless they are intentionally asking for support. The app is read-only and does not persist contact rows.

## Scope Notes

Required scopes:

- `oauth`
- `crm.objects.contacts.read`
- `forms`

Optional scope:

- `communication_preferences.statuses.batch.read`

If HubSpot does not grant the optional communication-preferences scope in a portal, the tester can continue with required scopes only. The app will surface a scope note and still run the available read-only checks.

## Warm Ask Template

Use this only with trusted contacts or people who have agreed to help. Do not send it as cold commercial outreach.

```text
Hey [Name], quick favor: we need three real HubSpot production installs before HubSpot lets us submit our Marketplace listing.

The app is a read-only pre-send consent/sendability scanner. It checks contacts, forms, subscription status, hard bounces, and quarantine signals, then exports a CSV/PDF evidence pack. It does not edit HubSpot data, send email, or store contact rows.

Could you install it in your HubSpot portal, open the dashboard, and click the CSV and PDF export once? Please keep it installed until we finish the Marketplace submission gate.

Install link:
https://app.hubspot.com/oauth/authorize?client_id=035ceb82-6076-4dba-8ff4-9dff7bc639e4&redirect_uri=https%3A%2F%2Fhubspot-sendability-consent-scanner.vercel.app%2Fapi%2Fhubspot%2Fcallback&scope=oauth+crm.objects.contacts.read+forms&optional_scope=communication_preferences.statuses.batch.read&state=sendability-consent-scanner
```

## Internal Next Step

After three qualifying installs are confirmed, open the HubSpot developer account `Radom UG` (`148666587`), app `Sendability Consent Scanner for HubSpot` (`42181310`), check whether the Marketplace listing gate is cleared, and create the listing with the copy in `docs/hubspot-marketplace-submission.md`.
