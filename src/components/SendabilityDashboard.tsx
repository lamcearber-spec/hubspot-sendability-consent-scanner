import {
  AlertTriangle,
  ArrowDownToLine,
  BadgeCheck,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MailCheck,
  PlugZap
} from "lucide-react";
import { toBlockedContactsCsv } from "@/lib/sendability/export";
import type { SendabilityReport } from "@/lib/sendability/types";

type SendabilityDashboardProps = {
  report: SendabilityReport;
  installUrl?: string;
  mode: "fixture" | "connected";
};

export function SendabilityDashboard({ report, installUrl, mode }: SendabilityDashboardProps) {
  return (
    <main className="shell">
      <section className="topbar" aria-label="Sendability summary">
        <div>
          <p className="eyebrow">HubSpot consent and deliverability</p>
          <h1>Sendability Consent Scanner</h1>
          <p className="subcopy">
            Read-only scan for contacts blocked by missing consent, subscription mismatches, marketing-contact status,
            hard bounces, quarantine, or portal-wide opt-out.
          </p>
        </div>
        <div className="top-actions">
          {installUrl ? (
            <a className="button-link button-dark" href={installUrl}>
              <PlugZap size={16} aria-hidden="true" />
              Connect HubSpot
            </a>
          ) : null}
          <span className="mode-pill" title="No contact records are stored by this app.">
            <LockKeyhole size={15} aria-hidden="true" />
            {mode === "fixture" ? "Fixture scan" : "Connected scan"}
          </span>
        </div>
      </section>

      <section className="metrics" aria-label="Scan totals">
        <Metric label="Sendable now" value={`${report.deliverable}/${report.totalContacts}`} tone="good" />
        <Metric label="Blocked" value={String(report.blocked)} tone={report.blocked > 0 ? "risk" : "good"} />
        <Metric label="Coverage" value={`${report.coveragePercent}%`} tone={report.coveragePercent >= 80 ? "good" : "review"} />
      </section>

      <section className="notice" aria-label="Read-only data handling">
        <CheckCircle2 size={18} aria-hidden="true" />
        <span>Read-only by design. Scans run on demand, exports are generated in-session, and contacts are not stored.</span>
      </section>

      <div className="action-row" aria-label="Exports">
        <a className="button-link" href={csvHref(toBlockedContactsCsv(report))} download="hubspot-blocked-contacts.csv">
          <ArrowDownToLine size={15} aria-hidden="true" />
          Blocked CSV
        </a>
        <a className="button-link" href="/api/sendability/pdf" download>
          <FileText size={15} aria-hidden="true" />
          Evidence PDF
        </a>
      </div>

      <section className="grid-two" aria-label="Coverage and reason breakdown">
        <div className="panel">
          <div className="panel-head">
            <h2>
              <MailCheck size={18} aria-hidden="true" />
              List coverage
            </h2>
            <span className="badge">{report.targetSubscriptionNames.join(", ") || "No subscription"}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>List</th>
                  <th>Deliverable</th>
                  <th>Blocked</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {report.listCoverage.map((list) => (
                  <tr key={list.listName}>
                    <td>{list.listName}</td>
                    <td>{list.deliverable}</td>
                    <td>{list.blocked}</td>
                    <td>{list.coveragePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>
              <AlertTriangle size={18} aria-hidden="true" />
              Block reasons
            </h2>
          </div>
          <div className="reason-list">
            {Object.entries(report.reasonCounts)
              .filter(([, count]) => count > 0)
              .map(([reason, count]) => (
                <div className="reason-row" key={reason}>
                  <span>{reason.replaceAll("-", " ")}</span>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="panel full-panel" aria-label="Form consent mapping">
        <div className="panel-head">
          <h2>
            <BadgeCheck size={18} aria-hidden="true" />
            Form consent mapping
          </h2>
          <span className="badge badge-review">
            {report.formFindings.filter((finding) => finding.severity !== "ok").length} review
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Form</th>
                <th>Status</th>
                <th>Finding</th>
              </tr>
            </thead>
            <tbody>
              {report.formFindings.map((finding) => (
                <tr key={finding.formId}>
                  <td>{finding.formName}</td>
                  <td>
                    <span className={`status status-${finding.severity}`}>{finding.severity}</span>
                  </td>
                  <td>{finding.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel full-panel" aria-label="Blocked contact sample">
        <div className="panel-head">
          <h2>
            <AlertTriangle size={18} aria-hidden="true" />
            Blocked contacts
          </h2>
          <span className="badge">{report.blocked} rows</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>List</th>
                <th>Reason</th>
                <th>Matched subscription</th>
              </tr>
            </thead>
            <tbody>
              {report.contacts
                .filter((contact) => contact.status === "BLOCKED")
                .map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.email ?? "No email"}</td>
                    <td>{contact.listName ?? "Selected contacts"}</td>
                    <td>{contact.reasonLabel}</td>
                    <td>{contact.matchedSubscriptionNames.join(", ") || "None"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {report.scopeWarnings.length > 0 ? (
        <section className="scope-notes" aria-label="Scope notes">
          {report.scopeWarnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "good" | "review" | "risk" }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function csvHref(csv: string): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}
