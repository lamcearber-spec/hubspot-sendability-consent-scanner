import { PassThrough } from "node:stream";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import type { ContactClassification, SendabilityReport } from "./types";

export async function renderSendabilityPdf(report: SendabilityReport): Promise<Uint8Array> {
  const doc = new PDFDocument({ size: "A4", margin: 44 });
  const chunks: Buffer[] = [];
  const stream = new PassThrough();
  const finished = new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  doc.pipe(stream);
  renderCover(doc, report);
  renderBlockedContacts(doc, report.contacts.filter((contact) => contact.status === "BLOCKED"));
  doc.end();

  await finished;
  return Buffer.concat(chunks);
}

function renderCover(doc: PDFKit.PDFDocument, report: SendabilityReport): void {
  doc.fontSize(10).fillColor("#0b6bcb").text("HUBSPOT SENDABILITY CONSENT SCAN");
  doc.moveDown(0.35);
  doc.fontSize(24).fillColor("#16181d").text("Sendability Consent Scanner");
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#667085").text(`Account: ${report.accountName}`);
  doc.text(`Generated: ${report.generatedAt}`);
  doc.text(`Selected subscriptions: ${report.targetSubscriptionNames.join(", ") || "none selected"}`);
  doc.moveDown(1);

  fact(doc, "Deliverable", `${report.deliverable} of ${report.totalContacts}`);
  fact(doc, "Blocked", String(report.blocked));
  fact(doc, "Coverage", `${report.coveragePercent}%`);

  doc.moveDown(0.5);
  doc.fontSize(13).fillColor("#16181d").text("Block reasons");
  for (const [reason, count] of Object.entries(report.reasonCounts)) {
    if (count > 0) {
      doc.fontSize(10).fillColor("#353842").text(`${reason}: ${count}`);
    }
  }

  if (report.scopeWarnings.length > 0) {
    doc.moveDown(0.7);
    doc.fontSize(13).fillColor("#16181d").text("Scope notes");
    for (const warning of report.scopeWarnings) {
      doc.fontSize(10).fillColor("#7a4b00").text(`- ${warning}`, { width: 500 });
    }
  }

  doc.moveDown(0.7);
  doc.fontSize(13).fillColor("#16181d").text("Form consent mapping");
  for (const finding of report.formFindings) {
    doc.fontSize(10).fillColor(finding.severity === "ok" ? "#0f766e" : "#9a3412").text(
      `${finding.formName}: ${finding.message}`,
      { width: 500 }
    );
  }
}

function renderBlockedContacts(doc: PDFKit.PDFDocument, contacts: ContactClassification[]): void {
  doc.addPage();
  doc.fontSize(16).fillColor("#16181d").text("Blocked contacts");
  doc.moveDown(0.6);

  if (contacts.length === 0) {
    doc.fontSize(10).fillColor("#475467").text("No blocked contacts found in this scan.");
    return;
  }

  for (const contact of contacts) {
    ensureSpace(doc, 58);
    doc.fontSize(9).fillColor("#667085").text(`${contact.id} | ${contact.listName ?? "Selected contacts"}`);
    doc.fontSize(10).fillColor("#16181d").text(`${contact.email ?? "No email"} - ${contact.reasonLabel}`);
    if (contact.hardBounceReason || contact.quarantinedReason) {
      doc.fontSize(9).fillColor("#7a4b00").text(contact.hardBounceReason ?? contact.quarantinedReason ?? "");
    }
    doc.moveDown(0.45);
  }
}

function fact(doc: PDFKit.PDFDocument, label: string, value: string): void {
  doc.fontSize(8).fillColor("#667085").text(label.toUpperCase());
  doc.fontSize(15).fillColor("#16181d").text(value);
  doc.moveDown(0.45);
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}
