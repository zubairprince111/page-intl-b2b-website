import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => ({
    options: opts,
  }),
  Link: ({
    children,
    to,
    ...props
  }: { children: ReactNode; to?: string } & Record<string, unknown>) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/admin/AdminLayout", () => ({
  AdminLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
}));

vi.mock("@/lib/data-client", () => ({
  useAdminStats: () => ({
    isLoading: false,
    data: {
      totalProducts: 18,
      lowStockCount: 2,
      pendingQuotes: 3,
      totalQuotes: 9,
      totalBookings: 6,
      pendingBookings: 2,
      activeBanners: 4,
      totalRevenue: 450000,
      lowStockItems: [
        {
          id: "p1",
          slug: "two-post-lift-4t",
          name: "4.0T Hydraulic 2-Post Lift",
          sku: "PG-LIFT-4T",
          category: "Garage Equipment",
          warehouseQty: 1,
          reorderLevel: 3,
        },
      ],
      categoryDistribution: [{ name: "Garage Equipment", count: 10 }],
      recentQuotes: [],
      recentBookings: [],
    },
  }),
}));

import { AdminDashboard } from "@/routes/admin/index";

afterEach(() => {
  cleanup();
});

describe("Admin Dashboard telemetry integrity", () => {
  it("excludes fake revenue charts and revenue stat cards while rendering real DB cards", () => {
    const { container } = render(<AdminDashboard />);
    const text = container.textContent ?? "";

    expect(screen.queryByText(/Revenue Overview/i)).toBeNull();
    expect(screen.queryByText(/Realized Revenue/i)).toBeNull();
    expect(text).not.toContain("+12.5%");
    expect(text).not.toContain("+4.3%");

    expect(screen.getByText("Total Products")).toBeTruthy();
    expect(screen.getByText("Low Stock Alerts")).toBeTruthy();
    expect(screen.getByText("Low Stock Watchlist")).toBeTruthy();
    expect(screen.getByText("4.0T Hydraulic 2-Post Lift")).toBeTruthy();
    expect(screen.getByText("Inventory by Category")).toBeTruthy();
  });
});
