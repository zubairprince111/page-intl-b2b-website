import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { Product } from "@/lib/data";

const sampleNonQuoteProduct: Product = {
  slug: "synthetic-engine-oil-5w30-4l",
  name: "Full Synthetic Motor Oil 5W-30 (4L)",
  brand: "Torq",
  category: "Lubricants & Fluids",
  mobility: ["4-Wheeler", "EV"],
  price: 4250,
  oldPrice: 5600,
  rating: 4.8,
  reviews: 12,
  stock: "In stock",
  warehouseQty: 24,
  reorderLevel: 5,
  image: "/oil.jpg",
  images: ["/oil.jpg"],
  fits: ["Multi-Brand Passenger Vehicles"],
  features: ["API SP certified thermal stability"],
  sku: "TQ-OIL-5W30",
  description: "Commercial fleet synthetic motor oil.",
  specs: [["Viscosity", "5W-30"]],
  isEquipment: false,
  requiresQuote: false,
  priceLabel: "B2B Unit Price",
};

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => ({
    options: opts,
    useLoaderData: () => ({
      p: sampleNonQuoteProduct,
      initialCatalog: [sampleNonQuoteProduct],
    }),
  }),
  Link: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
  notFound: () => new Error("Not found"),
}));

vi.mock("@/lib/data-client", () => ({
  useProductBySlug: (_slug: string, initial: Product) => ({ data: initial }),
  useCatalogProducts: (initial: Product[]) => ({ data: initial }),
  useQuoteSubmissionConfig: () => ({ data: { requireEmailOtp: false }, refetch: vi.fn() }),
  useCreateQuote: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSendQuoteOtp: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useVerifyAndSubmitQuote: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/lib/cart", () => ({
  useCart: () => ({
    add: vi.fn(),
    vehicle: null,
    lines: [],
  }),
}));

import { ProductCard } from "@/components/site/ProductCard";
import { ProductPage, Route } from "@/routes/shop.$slug";

afterEach(() => {
  cleanup();
});

describe("Storefront pricing suppression", () => {
  it("never displays numeric unit prices or taka symbols on product detail pages even when requiresQuote is false", () => {
    const { container } = render(<ProductPage />);

    expect(screen.getByText("Quotation on Request")).toBeTruthy();
    expect(screen.getByText("(Pro-Forma B2B)")).toBeTruthy();

    const text = container.textContent ?? "";
    expect(text).not.toContain("৳");
    expect(text).not.toContain("4,250");
    expect(text).not.toContain("5,600");
    expect(text).not.toContain("B2B Unit Price");
  });

  it("never exposes unit price fields in product SEO JSON-LD structured data", () => {
    const headFn = Route.options.head as unknown as (ctx: { loaderData?: { p: Product } }) => {
      scripts?: { children?: string }[];
    };

    const headResult = headFn({ loaderData: { p: sampleNonQuoteProduct } });
    const jsonLd = headResult.scripts?.[0]?.children ?? "";

    expect(jsonLd).toContain("https://schema.org");
    expect(jsonLd).not.toContain("priceCurrency");
    expect(jsonLd).not.toContain('"price"');
    expect(jsonLd).not.toContain("4250");
  });

  it("never renders prices on catalog ProductCard tiles", () => {
    const { container } = render(<ProductCard p={sampleNonQuoteProduct} />);
    const text = container.textContent ?? "";

    expect(screen.getByText("Get Quote")).toBeTruthy();
    expect(text).not.toContain("৳");
    expect(text).not.toContain("4,250");
  });
});
