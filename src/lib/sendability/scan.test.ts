import { describe, expect, it } from "vitest";
import { demoScanInput } from "./fixtures";
import { buildSendabilityReport } from "./scan";

describe("buildSendabilityReport", () => {
  it("classifies deliverable and blocked contacts", () => {
    const report = buildSendabilityReport(demoScanInput);

    expect(report.totalContacts).toBe(6);
    expect(report.deliverable).toBe(1);
    expect(report.blocked).toBe(5);
    expect(report.coveragePercent).toBe(16.7);
    expect(report.reasonCounts["opted-out-type"]).toBe(1);
    expect(report.reasonCounts["non-marketing-contact"]).toBe(1);
    expect(report.reasonCounts["hard-bounced"]).toBe(1);
    expect(report.reasonCounts["opted-out-all"]).toBe(1);
    expect(report.reasonCounts.quarantined).toBe(1);
  });

  it("flags form subscription mismatches", () => {
    const report = buildSendabilityReport(demoScanInput);

    expect(report.formFindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ formName: "Trial request form", severity: "missing" }),
        expect.objectContaining({ formName: "Webinar registration", severity: "review" }),
        expect.objectContaining({ formName: "Lead magnet form", severity: "ok" })
      ])
    );
  });
});
