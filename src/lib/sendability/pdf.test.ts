import { describe, expect, it } from "vitest";
import { demoReport } from "./fixtures";
import { renderSendabilityPdf } from "./pdf";

describe("renderSendabilityPdf", () => {
  it("renders a valid PDF", async () => {
    const pdf = await renderSendabilityPdf(demoReport);
    const header = Buffer.from(pdf.subarray(0, 4)).toString("utf8");

    expect(header).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });
});
