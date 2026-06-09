import { buildSendabilityReport } from "./scan";
import type { SendabilityReport, SendabilityScanInput } from "./types";

export const demoScanInput: SendabilityScanInput = {
  accountName: "Northstar Demo Portal",
  generatedAt: "2026-06-09T08:30:00.000Z",
  targetSubscriptionTypeIds: ["88221657"],
  subscriptionDefinitions: [
    {
      id: "88221657",
      name: "Marketing newsletter",
      active: true,
      channel: "EMAIL",
      defaultSubscriptionStatus: "NOT_SUBSCRIBED"
    },
    {
      id: "77110512",
      name: "Product updates",
      active: true,
      channel: "EMAIL",
      defaultSubscriptionStatus: "NOT_SUBSCRIBED"
    }
  ],
  contacts: [
    {
      id: "101",
      email: "ada@example.com",
      listName: "June campaign list",
      marketingContact: true,
      legalBasis: "CONSENT"
    },
    {
      id: "102",
      email: "ben@example.com",
      listName: "June campaign list",
      marketingContact: true
    },
    {
      id: "103",
      email: "cara@example.com",
      listName: "June campaign list",
      marketingContact: false
    },
    {
      id: "104",
      email: "diego@example.com",
      listName: "Webinar leads",
      marketingContact: true,
      hardBounceCount: 1,
      hardBounceReason: "recipient unknown"
    },
    {
      id: "105",
      email: "emilia@example.com",
      listName: "Webinar leads",
      marketingContact: true
    },
    {
      id: "106",
      email: "fran@example.com",
      listName: "Webinar leads",
      marketingContact: true,
      quarantined: true,
      quarantinedReason: "recipient complaint"
    }
  ],
  subscriptionStatuses: [
    { email: "ada@example.com", subscriptionId: "88221657", status: "SUBSCRIBED", legalBasis: "CONSENT" },
    { email: "ben@example.com", subscriptionId: "88221657", status: "UNSUBSCRIBED" },
    { email: "cara@example.com", subscriptionId: "88221657", status: "SUBSCRIBED" },
    { email: "diego@example.com", subscriptionId: "88221657", status: "SUBSCRIBED" },
    { email: "emilia@example.com", subscriptionId: "77110512", status: "SUBSCRIBED" },
    { email: "fran@example.com", subscriptionId: "88221657", status: "SUBSCRIBED" }
  ],
  unsubscribeAllStatuses: [
    { email: "ada@example.com", status: "SUBSCRIBED" },
    { email: "emilia@example.com", status: "UNSUBSCRIBED" }
  ],
  forms: [
    { id: "lead-form", name: "Lead magnet form", subscriptionTypeIds: ["88221657"] },
    { id: "trial-form", name: "Trial request form", subscriptionTypeIds: [] },
    { id: "webinar-form", name: "Webinar registration", subscriptionTypeIds: ["77110512"] }
  ],
  scopeWarnings: [
    "Demo mode uses fixture contacts. Live HubSpot scans run on demand and do not store contact records."
  ]
};

export const demoReport: SendabilityReport = buildSendabilityReport(demoScanInput);
