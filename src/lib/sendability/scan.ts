import type {
  BlockReason,
  ContactClassification,
  FormFinding,
  ListCoverage,
  SendabilityReport,
  SendabilityScanInput,
  SubscriptionStatusRecord
} from "./types";

const REASON_LABELS: Record<BlockReason, string> = {
  "no-email": "No email address",
  "no-subscription-type": "No subscription type selected",
  "not-opted-in": "Not opted in",
  "opted-out-type": "Opted out of selected subscription",
  "opted-out-all": "Opted out of all email",
  "non-marketing-contact": "Not a marketing contact",
  "hard-bounced": "Hard bounced",
  quarantined: "Email quarantined"
};

export function buildSendabilityReport(input: SendabilityScanInput): SendabilityReport {
  const targetIds = new Set(input.targetSubscriptionTypeIds.map(String));
  const definitionsById = new Map(input.subscriptionDefinitions.map((definition) => [String(definition.id), definition]));
  const statusesByEmail = groupStatusesByEmail(input.subscriptionStatuses);
  const unsubscribeAllByEmail = new Map(
    input.unsubscribeAllStatuses.map((status) => [normalizeEmail(status.email), status.status])
  );

  const contacts = input.contacts.map<ContactClassification>((contact) => {
    const email = normalizeEmail(contact.email);
    const statuses = statusesByEmail.get(email) ?? [];
    const matchingStatuses = statuses.filter((status) => targetIds.has(String(status.subscriptionId)));
    const matchedSubscriptionNames = matchingStatuses.map((status) => {
      return definitionsById.get(String(status.subscriptionId))?.name ?? `Subscription ${status.subscriptionId}`;
    });
    const reason = classifyBlockReason({
      hasEmail: Boolean(email),
      targetCount: targetIds.size,
      marketingContact: contact.marketingContact,
      hardBounceCount: contact.hardBounceCount ?? 0,
      hardBounceReason: contact.hardBounceReason,
      quarantined: contact.quarantined,
      unsubscribeAllStatus: unsubscribeAllByEmail.get(email),
      matchingStatuses
    });

    return {
      ...contact,
      status: reason ? "BLOCKED" : "DELIVERABLE",
      reason,
      reasonLabel: reason ? REASON_LABELS[reason] : undefined,
      matchedSubscriptionNames
    };
  });

  const deliverable = contacts.filter((contact) => contact.status === "DELIVERABLE").length;
  const blocked = contacts.length - deliverable;
  const reasonCounts = emptyReasonCounts();
  for (const contact of contacts) {
    if (contact.reason) {
      reasonCounts[contact.reason] += 1;
    }
  }

  return {
    accountName: input.accountName,
    generatedAt: input.generatedAt,
    totalContacts: contacts.length,
    deliverable,
    blocked,
    coveragePercent: percent(deliverable, contacts.length),
    reasonCounts,
    listCoverage: buildListCoverage(contacts),
    contacts,
    formFindings: buildFormFindings(input.forms, targetIds, definitionsById),
    targetSubscriptionNames: input.targetSubscriptionTypeIds.map((id) => {
      return definitionsById.get(String(id))?.name ?? `Subscription ${id}`;
    }),
    scopeWarnings: input.scopeWarnings ?? []
  };
}

function classifyBlockReason(input: {
  hasEmail: boolean;
  targetCount: number;
  marketingContact?: boolean;
  hardBounceCount: number;
  hardBounceReason?: string;
  quarantined?: boolean;
  unsubscribeAllStatus?: string;
  matchingStatuses: SubscriptionStatusRecord[];
}): BlockReason | undefined {
  if (!input.hasEmail) {
    return "no-email";
  }
  if (input.quarantined) {
    return "quarantined";
  }
  if (input.hardBounceCount > 0 || Boolean(input.hardBounceReason)) {
    return "hard-bounced";
  }
  if (upper(input.unsubscribeAllStatus) === "UNSUBSCRIBED") {
    return "opted-out-all";
  }
  if (input.marketingContact === false) {
    return "non-marketing-contact";
  }
  if (input.targetCount === 0) {
    return "no-subscription-type";
  }
  if (input.matchingStatuses.length === 0) {
    return "not-opted-in";
  }
  if (input.matchingStatuses.some((status) => upper(status.status) === "UNSUBSCRIBED")) {
    return "opted-out-type";
  }
  if (!input.matchingStatuses.some((status) => upper(status.status) === "SUBSCRIBED")) {
    return "not-opted-in";
  }

  return undefined;
}

function buildListCoverage(contacts: ContactClassification[]): ListCoverage[] {
  const groups = new Map<string, ContactClassification[]>();
  for (const contact of contacts) {
    const listName = contact.listName || "Selected contacts";
    groups.set(listName, [...(groups.get(listName) ?? []), contact]);
  }

  return [...groups.entries()].map(([listName, rows]) => {
    const deliverable = rows.filter((row) => row.status === "DELIVERABLE").length;
    return {
      listName,
      total: rows.length,
      deliverable,
      blocked: rows.length - deliverable,
      coveragePercent: percent(deliverable, rows.length)
    };
  });
}

function buildFormFindings(
  forms: SendabilityScanInput["forms"],
  targetIds: Set<string>,
  definitionsById: Map<string, SendabilityScanInput["subscriptionDefinitions"][number]>
): FormFinding[] {
  return forms.map((form) => {
    const formIds = new Set(form.subscriptionTypeIds.map(String));
    if (formIds.size === 0) {
      return {
        formId: form.id,
        formName: form.name,
        severity: "missing",
        message: "No subscription type mapping found on this form."
      };
    }

    const hasTarget = [...targetIds].some((id) => formIds.has(id));
    if (!hasTarget) {
      const names = [...formIds].map((id) => definitionsById.get(id)?.name ?? `Subscription ${id}`);
      return {
        formId: form.id,
        formName: form.name,
        severity: "review",
        message: `Form collects ${names.join(", ")} but not the selected send subscription.`
      };
    }

    return {
      formId: form.id,
      formName: form.name,
      severity: "ok",
      message: "Mapped to the selected send subscription."
    };
  });
}

function groupStatusesByEmail(statuses: SubscriptionStatusRecord[]): Map<string, SubscriptionStatusRecord[]> {
  const groups = new Map<string, SubscriptionStatusRecord[]>();
  for (const status of statuses) {
    const email = normalizeEmail(status.email);
    groups.set(email, [...(groups.get(email) ?? []), status]);
  }
  return groups;
}

function emptyReasonCounts(): Record<BlockReason, number> {
  return {
    "no-email": 0,
    "no-subscription-type": 0,
    "not-opted-in": 0,
    "opted-out-type": 0,
    "opted-out-all": 0,
    "non-marketing-contact": 0,
    "hard-bounced": 0,
    quarantined: 0
  };
}

function normalizeEmail(email?: string): string {
  return (email ?? "").trim().toLowerCase();
}

function upper(value?: string): string {
  return (value ?? "").toUpperCase();
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 1000) / 10;
}
