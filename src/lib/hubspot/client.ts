import type {
  ContactRecord,
  HubSpotFormRecord,
  SendabilityScanInput,
  SubscriptionDefinition,
  SubscriptionStatusRecord,
  UnsubscribeAllRecord
} from "@/lib/sendability/types";
import { buildSendabilityReport } from "@/lib/sendability/scan";

const HUBSPOT_BASE_URL = "https://api.hubapi.com";
const API_VERSION = "2026-03";
const CONTACT_PROPERTIES = [
  "email",
  "hs_marketable_status",
  "hs_email_bounce",
  "hs_email_quarantined",
  "hs_email_quarantined_reason",
  "hs_email_hard_bounce_reason"
] as const;

export async function scanHubSpotAccount(accessToken: string): Promise<ReturnType<typeof buildSendabilityReport>> {
  const scopeWarnings: string[] = [];
  const definitions = await readSubscriptionDefinitions(accessToken).catch((error: Error) => {
    scopeWarnings.push(`Could not read subscription definitions: ${error.message}`);
    return [];
  });
  const targetIds = definitions.filter((definition) => definition.active).slice(0, 1).map((definition) => definition.id);
  const contacts = await searchContacts(accessToken).catch((error: Error) => {
    scopeWarnings.push(`Could not read contacts: ${error.message}`);
    return [];
  });
  const emails = contacts.map((contact) => contact.email).filter((email): email is string => Boolean(email));
  const statuses = await batchReadSubscriptionStatuses(accessToken, emails).catch((error: Error) => {
    scopeWarnings.push(`Subscription status batch read unavailable: ${error.message}`);
    return [];
  });
  const unsubscribeAll = await batchReadUnsubscribeAll(accessToken, emails).catch((error: Error) => {
    scopeWarnings.push(`Portal-wide opt-out batch read unavailable: ${error.message}`);
    return [];
  });
  const forms = await readForms(accessToken).catch((error: Error) => {
    scopeWarnings.push(`Could not read forms: ${error.message}`);
    return [];
  });

  const input: SendabilityScanInput = {
    accountName: "Connected HubSpot portal",
    generatedAt: new Date().toISOString(),
    contacts,
    targetSubscriptionTypeIds: targetIds,
    subscriptionDefinitions: definitions,
    subscriptionStatuses: statuses,
    unsubscribeAllStatuses: unsubscribeAll,
    forms,
    scopeWarnings
  };

  return buildSendabilityReport(input);
}

export async function readSubscriptionDefinitions(accessToken: string): Promise<SubscriptionDefinition[]> {
  const json = await hubspotFetch<{ results?: unknown[] }>(
    accessToken,
    `/communication-preferences/${API_VERSION}/definitions?includeTranslations=false`
  );

  return (json.results ?? []).map((item) => {
    const record = item as Record<string, unknown>;
    return {
      id: String(record.id),
      name: String(record.name ?? `Subscription ${record.id}`),
      active: record.active !== false,
      channel: String(record.channel ?? "EMAIL"),
      defaultSubscriptionStatus: stringValue(record.defaultSubscriptionStatus)
    };
  });
}

export async function batchReadSubscriptionStatuses(
  accessToken: string,
  emails: string[]
): Promise<SubscriptionStatusRecord[]> {
  if (emails.length === 0) {
    return [];
  }
  const json = await hubspotFetch<{ results?: unknown[] }>(
    accessToken,
    `/communication-preferences/${API_VERSION}/statuses/batch/read`,
    {
      method: "POST",
      body: JSON.stringify({ inputs: emails.slice(0, 100) })
    }
  );

  return (json.results ?? []).flatMap((item) => {
    const result = item as { subscriberIdString?: string; statuses?: unknown[] };
    return (result.statuses ?? []).map((status) => {
      const record = status as Record<string, unknown>;
      return {
        email: String(result.subscriberIdString ?? record.subscriberIdString ?? ""),
        subscriptionId: String(record.subscriptionId),
        status: String(record.status ?? "UNKNOWN"),
        legalBasis: stringValue(record.legalBasis)
      };
    });
  });
}

export async function batchReadUnsubscribeAll(
  accessToken: string,
  emails: string[]
): Promise<UnsubscribeAllRecord[]> {
  if (emails.length === 0) {
    return [];
  }
  const json = await hubspotFetch<{ results?: unknown[] }>(
    accessToken,
    `/communication-preferences/${API_VERSION}/statuses/batch/unsubscribe-all/read?channel=EMAIL`,
    {
      method: "POST",
      body: JSON.stringify({ inputs: emails.slice(0, 100) })
    }
  );

  return (json.results ?? []).flatMap((item) => {
    const result = item as { subscriberIdString?: string; wideStatuses?: unknown[] };
    return (result.wideStatuses ?? []).map((wideStatus) => {
      const record = wideStatus as Record<string, unknown>;
      return {
        email: String(result.subscriberIdString ?? record.subscriberIdString ?? ""),
        status: String(record.status ?? "UNKNOWN")
      };
    });
  });
}

export async function searchContacts(accessToken: string): Promise<ContactRecord[]> {
  const json = await hubspotFetch<{ results?: unknown[] }>(accessToken, `/crm/objects/${API_VERSION}/contacts/search`, {
    method: "POST",
    body: JSON.stringify({
      limit: 100,
      properties: CONTACT_PROPERTIES
    })
  });

  return (json.results ?? []).map((item) => {
    const record = item as { id?: string; properties?: Record<string, string | undefined> };
    const properties = record.properties ?? {};
    return {
      id: String(record.id ?? properties.email ?? "unknown"),
      email: properties.email,
      marketingContact: parseMarketingContact(properties.hs_marketable_status),
      hardBounceCount: Number(properties.hs_email_bounce ?? 0),
      hardBounceReason: properties.hs_email_hard_bounce_reason,
      quarantined: properties.hs_email_quarantined === "true",
      quarantinedReason: properties.hs_email_quarantined_reason
    };
  });
}

export async function readForms(accessToken: string): Promise<HubSpotFormRecord[]> {
  const json = await hubspotFetch<{ results?: unknown[] }>(accessToken, `/marketing/v3/forms`);

  return (json.results ?? []).map((item) => {
    const record = item as Record<string, unknown>;
    return {
      id: String(record.id ?? record.guid ?? record.name),
      name: String(record.name ?? "Untitled form"),
      subscriptionTypeIds: extractSubscriptionIds(record)
    };
  });
}

async function hubspotFetch<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}${text ? `: ${text.slice(0, 160)}` : ""}`);
  }

  return (await response.json()) as T;
}

function extractSubscriptionIds(record: Record<string, unknown>): string[] {
  const source = JSON.stringify(record);
  const ids = new Set<string>();
  const regex = /"subscription(?:Type)?Id"\s*:\s*"?(\d+)"?/gi;
  let match = regex.exec(source);
  while (match) {
    ids.add(match[1]);
    match = regex.exec(source);
  }
  return [...ids];
}

function parseMarketingContact(value?: string): boolean | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.toLowerCase();
  if (["true", "marketing", "marketable"].includes(normalized)) {
    return true;
  }
  if (["false", "non_marketing", "not_marketable"].includes(normalized)) {
    return false;
  }
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}
