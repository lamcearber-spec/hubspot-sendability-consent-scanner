import type { ContactClassification, SendabilityReport } from "./types";

const BLOCKED_COLUMNS = [
  "contact_id",
  "email",
  "list",
  "reason",
  "marketing_contact",
  "hard_bounce_reason",
  "quarantined_reason",
  "matched_subscriptions"
] as const;

export function toBlockedContactsCsv(report: SendabilityReport): string {
  const rows = report.contacts
    .filter((contact) => contact.status === "BLOCKED")
    .map((contact) => [
      contact.id,
      contact.email ?? "",
      contact.listName ?? "",
      contact.reasonLabel ?? contact.reason ?? "",
      formatBoolean(contact.marketingContact),
      contact.hardBounceReason ?? "",
      contact.quarantinedReason ?? "",
      contact.matchedSubscriptionNames.join("; ")
    ]);

  return [BLOCKED_COLUMNS, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function toSummaryCsv(report: SendabilityReport): string {
  const rows = [
    ["account_name", report.accountName],
    ["generated_at", report.generatedAt],
    ["selected_subscriptions", report.targetSubscriptionNames.join("; ")],
    ["total_contacts", String(report.totalContacts)],
    ["deliverable", String(report.deliverable)],
    ["blocked", String(report.blocked)],
    ["coverage_percent", String(report.coveragePercent)]
  ];

  for (const coverage of report.listCoverage) {
    rows.push([
      `list:${coverage.listName}`,
      `${coverage.deliverable}/${coverage.total} deliverable (${coverage.coveragePercent}%)`
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function countBlockedContacts(contacts: ContactClassification[]): number {
  return contacts.filter((contact) => contact.status === "BLOCKED").length;
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatBoolean(value?: boolean): string {
  if (value === undefined) {
    return "unknown";
  }
  return value ? "yes" : "no";
}
