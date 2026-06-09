export type BlockReason =
  | "no-email"
  | "no-subscription-type"
  | "not-opted-in"
  | "opted-out-type"
  | "opted-out-all"
  | "non-marketing-contact"
  | "hard-bounced"
  | "quarantined";

export type ContactRecord = {
  id: string;
  email?: string;
  listName?: string;
  marketingContact?: boolean;
  hardBounceCount?: number;
  hardBounceReason?: string;
  quarantined?: boolean;
  quarantinedReason?: string;
  legalBasis?: string;
};

export type SubscriptionDefinition = {
  id: string;
  name: string;
  active: boolean;
  channel?: "EMAIL" | string;
  defaultSubscriptionStatus?: string;
};

export type SubscriptionStatusRecord = {
  email: string;
  subscriptionId: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | "NOT_SUBSCRIBED" | string;
  legalBasis?: string | null;
};

export type UnsubscribeAllRecord = {
  email: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | string;
};

export type HubSpotFormRecord = {
  id: string;
  name: string;
  subscriptionTypeIds: string[];
};

export type SendabilityScanInput = {
  accountName: string;
  generatedAt: string;
  contacts: ContactRecord[];
  targetSubscriptionTypeIds: string[];
  subscriptionDefinitions: SubscriptionDefinition[];
  subscriptionStatuses: SubscriptionStatusRecord[];
  unsubscribeAllStatuses: UnsubscribeAllRecord[];
  forms: HubSpotFormRecord[];
  scopeWarnings?: string[];
};

export type ContactClassification = ContactRecord & {
  status: "DELIVERABLE" | "BLOCKED";
  reason?: BlockReason;
  reasonLabel?: string;
  matchedSubscriptionNames: string[];
};

export type FormFinding = {
  formId: string;
  formName: string;
  severity: "ok" | "review" | "missing";
  message: string;
};

export type ListCoverage = {
  listName: string;
  total: number;
  deliverable: number;
  blocked: number;
  coveragePercent: number;
};

export type SendabilityReport = {
  accountName: string;
  generatedAt: string;
  totalContacts: number;
  deliverable: number;
  blocked: number;
  coveragePercent: number;
  reasonCounts: Record<BlockReason, number>;
  listCoverage: ListCoverage[];
  contacts: ContactClassification[];
  formFindings: FormFinding[];
  targetSubscriptionNames: string[];
  scopeWarnings: string[];
};
