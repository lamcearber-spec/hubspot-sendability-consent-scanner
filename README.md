# Sendability Consent Scanner for HubSpot

Read-only HubSpot Marketplace app for finding why selected marketing contacts are not sendable before a campaign.

## Marketplace Positioning

Suggested app name: `Sendability Consent Scanner for HubSpot`

Short description: `Find HubSpot contacts blocked by consent, subscription, hard-bounce, quarantine, or form mapping issues before you send.`

Search terms to work into the listing: HubSpot sendability, HubSpot consent scanner, deliverability, GDPR consent, subscription types, marketing contacts, hard bounce, forms, opt out, why are my HubSpot emails not sending.

Pricing:

- Free: 1 monthly scan
- Pro: USD 39/month for weekly and pre-send scans
- Agency: USD 99/month for multiple portals and evidence exports

## Read-Only Scopes

Required:

- `crm.objects.contacts.read`
- `forms`

Optional or Enterprise-gated:

- `communication_preferences.statuses.batch.read`

The app never requests write scopes.

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The dashboard uses fixture mode until HubSpot OAuth credentials are configured.

## Environment

Copy `.env.example` to `.env.local` and fill:

- `APP_BASE_URL`
- `HUBSPOT_CLIENT_ID`
- `HUBSPOT_CLIENT_SECRET`
- `HUBSPOT_REDIRECT_URI`

OAuth tokens are kept in a short-lived HttpOnly browser session cookie. Contact records are not persisted.

## HubSpot API Use

- `GET /communication-preferences/2026-03/definitions`
- `POST /communication-preferences/2026-03/statuses/batch/read`
- `POST /communication-preferences/2026-03/statuses/batch/unsubscribe-all/read?channel=EMAIL`
- `POST /crm/objects/2026-03/contacts/search`
- `GET /marketing/v3/forms`

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```
