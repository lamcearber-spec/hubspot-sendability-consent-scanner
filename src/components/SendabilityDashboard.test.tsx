import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoReport } from "@/lib/sendability/fixtures";
import { SendabilityDashboard } from "./SendabilityDashboard";

describe("SendabilityDashboard", () => {
  it("shows blocked reasons and form findings", () => {
    render(<SendabilityDashboard report={demoReport} mode="fixture" />);

    expect(screen.getByText("Sendable now")).toBeInTheDocument();
    expect(screen.getByText("Form consent mapping")).toBeInTheDocument();
    expect(screen.getByText("Trial request form")).toBeInTheDocument();
    expect(screen.getByText("Opted out of selected subscription")).toBeInTheDocument();
  });
});
