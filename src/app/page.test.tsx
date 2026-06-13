import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoReport } from "@/lib/sendability/fixtures";
import { encodeSession, SESSION_COOKIE } from "@/lib/hubspot/session";
import Page from "./page";

const testState = vi.hoisted(() => ({
  cookieHeader: "",
  scanHubSpotAccount: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    toString: () => testState.cookieHeader
  }))
}));

vi.mock("@/lib/hubspot/client", () => ({
  scanHubSpotAccount: testState.scanHubSpotAccount
}));

describe("Page", () => {
  beforeEach(() => {
    testState.cookieHeader = "";
    testState.scanHubSpotAccount.mockReset();
    testState.scanHubSpotAccount.mockResolvedValue(demoReport);
  });

  it("renders the fixture dashboard without a HubSpot session", async () => {
    render(await Page());

    expect(screen.getByRole("heading", { name: "Sendability Consent Scanner" })).toBeInTheDocument();
    expect(screen.getByText("Blocked CSV")).toBeInTheDocument();
    expect(screen.getByText("Evidence PDF")).toBeInTheDocument();
    expect(screen.getByText("Fixture scan")).toBeInTheDocument();
    expect(testState.scanHubSpotAccount).not.toHaveBeenCalled();
  });

  it("renders a connected scan when a HubSpot session cookie exists", async () => {
    testState.cookieHeader = `${SESSION_COOKIE}=${encodeSession({
      access_token: "hubspot-access-token",
      expires_in: 3600,
      token_type: "bearer"
    })}`;

    render(await Page());

    expect(screen.getByText("Connected scan")).toBeInTheDocument();
    expect(testState.scanHubSpotAccount).toHaveBeenCalledWith("hubspot-access-token");
  });
});
