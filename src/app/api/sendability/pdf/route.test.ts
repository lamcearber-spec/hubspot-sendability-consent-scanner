import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("PDF route", () => {
  it("returns a fixture PDF without a session", async () => {
    const response = await GET(new Request("http://localhost/api/sendability/pdf"));
    const bytes = new Uint8Array(await response.arrayBuffer());

    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(Buffer.from(bytes.subarray(0, 4)).toString("utf8")).toBe("%PDF");
  });
});
