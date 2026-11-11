import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import {
  ARCHITECTURE_DIAGRAMS,
  DATABASE_TABLES,
} from "@/components/docs/project-report-data";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => ({
    options: opts,
  }),
  Link: ({ children, to, ...props }: { children: ReactNode; to?: string } & Record<string, unknown>) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
}));

import { DocsPage } from "@/routes/docs";

afterEach(() => {
  cleanup();
});

describe("/docs Project Report Route", () => {
  it("renders the engineering report title, all 12 numbered sections, and all 10 SVG diagram assets", () => {
    render(<DocsPage />);

    expect(
      screen.getByRole("heading", { name: /Software Engineering Project Report/i }),
    ).toBeTruthy();

    for (let i = 1; i <= 12; i++) {
      const prefix = String(i).padStart(2, "0");
      expect(
        screen.getByRole("heading", { level: 2, name: new RegExp(`^${prefix}\\.`) }),
      ).toBeTruthy();
    }

    for (const diagram of ARCHITECTURE_DIAGRAMS) {
      const img = screen.getByAltText(diagram.title) as HTMLImageElement;
      expect(img.getAttribute("src")).toBe(diagram.src);
    }
  });

  it("filters the 16-table PostgreSQL schema dictionary and FR/NFR traceability matrix", () => {
    render(<DocsPage />);

    const dbTable = screen.getByTestId("database-dictionary-table");
    expect(DATABASE_TABLES.length).toBe(16);
    for (const table of DATABASE_TABLES) {
      expect(within(dbTable).getByText(table.name)).toBeTruthy();
    }

    // Filter table list strictly to audit_log
    const searchInput = screen.getByLabelText("Filter database tables");
    fireEvent.change(searchInput, { target: { value: "audit_log" } });
    expect(within(dbTable).getByText("audit_log")).toBeTruthy();
    expect(within(dbTable).queryByText("order_items")).toBeNull();

    // Filter requirements matrix to NFR only
    fireEvent.click(screen.getByRole("button", { name: /Non-Functional NFR/i }));
    expect(screen.getByText("NFR-01")).toBeTruthy();
    expect(screen.queryByText("FR-01")).toBeNull();
  });

  it("opens the interactive zoom modal when a user clicks a UML/ERD/DFD diagram", () => {
    render(<DocsPage />);

    const inspectBtn = screen.getByRole("button", {
      name: /Inspect Figure 6\.7 — Crow's Foot Entity-Relationship Diagram/i,
    });
    fireEvent.click(inspectBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain("7 / 10");
  });
});
