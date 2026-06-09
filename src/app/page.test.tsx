import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Page", () => {
  it("renders the sendability dashboard", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: "Sendability Consent Scanner" })).toBeInTheDocument();
    expect(screen.getByText("Blocked CSV")).toBeInTheDocument();
    expect(screen.getByText("Evidence PDF")).toBeInTheDocument();
  });
});
