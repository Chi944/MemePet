import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { HelpEntry } from "@/types/beta";
import { HelpPanel } from "./HelpPanel";

/** FICTIONAL test-only samples. Larm's reviewed copy lives in src/content/help.ts. */
const sampleEntries: readonly HelpEntry[] = [
  {
    id: "sample-gas",
    question: "Sample: why do I need testnet gas?",
    answer: "Sample answer paragraph one.\n\nSample answer paragraph two.",
    links: [{ label: "Sample guide", href: "https://example.invalid/guide" }],
  },
  {
    id: "sample-unsafe",
    question: "Sample: unsafe content",
    answer: "<img src=x onerror=alert(1)> **not markdown**",
    links: [
      { label: "Script link", href: "javascript:alert(1)" },
      { label: "Plain http link", href: "http://example.invalid/insecure" },
      { label: "Relative link", href: "/help" },
    ],
  },
];

describe("HelpPanel", () => {
  it("renders each entry as a keyboard-operable disclosure", () => {
    render(<HelpPanel entries={sampleEntries} supportUrl={null} />);
    const summary = screen.getByText("Sample: why do I need testnet gas?");
    expect(summary.tagName).toBe("SUMMARY");
    const details = summary.closest("details")!;
    expect(details).not.toHaveAttribute("open");
    fireEvent.click(summary);
    expect(details).toHaveAttribute("open");
    expect(within(details).getByText("Sample answer paragraph one.")).toBeInTheDocument();
    expect(within(details).getByText("Sample answer paragraph two.")).toBeInTheDocument();
  });

  it("renders verified https links only", () => {
    render(<HelpPanel entries={sampleEntries} supportUrl={null} />);
    const link = screen.getByRole("link", { name: /Sample guide/ });
    expect(link).toHaveAttribute("href", "https://example.invalid/guide");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(screen.queryByRole("link", { name: /Script link|Plain http link|Relative link/ })).not.toBeInTheDocument();
  });

  it("renders answers as plain text, never HTML or Markdown", () => {
    const { container } = render(<HelpPanel entries={sampleEntries} supportUrl={null} />);
    expect(screen.getByText("<img src=x onerror=alert(1)> **not markdown**")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("strong")).toBeNull();
  });

  it("shows a clear unavailable state when no support contact is verified", () => {
    render(<HelpPanel entries={sampleEntries} supportUrl={null} />);
    expect(screen.getByText(/Support contact unavailable/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Contact MemePet support/ })).not.toBeInTheDocument();
  });

  it("treats a non-https support URL as unverified", () => {
    render(<HelpPanel entries={sampleEntries} supportUrl="javascript:alert(1)" />);
    expect(screen.getByText(/Support contact unavailable/)).toBeInTheDocument();
  });

  it("links a verified support contact", () => {
    render(<HelpPanel entries={sampleEntries} supportUrl="https://example.invalid/support" />);
    expect(screen.getByRole("link", { name: /Contact MemePet support/ })).toHaveAttribute("href", "https://example.invalid/support");
    expect(screen.queryByText(/Support contact unavailable/)).not.toBeInTheDocument();
  });

  it("states that no help answers are available for an empty list", () => {
    render(<HelpPanel entries={[]} supportUrl={null} />);
    expect(screen.getByText("Help answers are not available right now.")).toBeInTheDocument();
  });

  it("labels both sections with headings", () => {
    render(<HelpPanel entries={sampleEntries} supportUrl={null} />);
    expect(screen.getByRole("region", { name: "Frequently asked questions" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Support" })).toBeInTheDocument();
  });
});
