import { describe, expect, it } from "vitest";
import { demoReport } from "./fixtures";
import { countBlockedContacts, toBlockedContactsCsv, toSummaryCsv } from "./export";

describe("sendability exports", () => {
  it("exports blocked contacts as CSV", () => {
    const csv = toBlockedContactsCsv(demoReport);

    expect(csv).toContain('"contact_id","email","list","reason"');
    expect(csv).toContain('"ben@example.com"');
    expect(countBlockedContacts(demoReport.contacts)).toBe(5);
  });

  it("exports summary rows", () => {
    const csv = toSummaryCsv(demoReport);

    expect(csv).toContain('"coverage_percent","16.7"');
    expect(csv).toContain('"list:June campaign list"');
  });
});
