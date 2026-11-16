import { describe, expect, it } from "vitest";
import { products } from "@/lib/data";
import {
  buildProductSearchIndex,
  buildShopSearchSuggestions,
  searchIndexedProducts,
  splitHighlightSegments,
} from "@/lib/shop-search";

describe("Optimized Shop Search & Prefix Suggestions", () => {
  const indexed = buildProductSearchIndex(products);

  it('shows word-prefix suggestions under "p" without matching filler words', () => {
    const suggestions = buildShopSearchSuggestions({
      scopedItems: indexed,
      allIndexedItems: indexed,
      rawQuery: "p",
    });

    expect(suggestions.keywords.length).toBeGreaterThan(0);
    expect(suggestions.keywords.some((kw) => kw.label.toLowerCase().startsWith("p"))).toBe(true);
    expect(suggestions.products.length).toBeGreaterThan(0);

    const pMatches = searchIndexedProducts(indexed, "p");
    expect(pMatches.length).toBeGreaterThan(0);
    expect(pMatches.length).toBeLessThan(products.length);

    // Product whose title features "PAD" or "PRO" must be returned
    expect(pMatches.some((m) => m.item.product.slug === "launch-x-431-pad9-link")).toBe(true);
  });

  it('narrows both suggestions and filtered product results cleanly when typing "pad"', () => {
    const pMatches = searchIndexedProducts(indexed, "p");
    const padMatches = searchIndexedProducts(indexed, "pad");

    expect(pMatches.some((m) => m.item.product.slug === "launch-x-431-pro5-smartlink")).toBe(true);
    expect(pMatches.some((m) => m.item.product.slug === "launch-x-431-pad9-link")).toBe(true);

    expect(padMatches.length).toBeGreaterThan(0);
    expect(padMatches.length).toBeLessThan(pMatches.length);

    // Non-"pad" P-products (PRO5) drop out cleanly when typing "pad"
    expect(padMatches.some((m) => m.item.product.slug === "launch-x-431-pro5-smartlink")).toBe(
      false,
    );
    expect(padMatches.some((m) => m.item.product.slug === "launch-x-431-pad9-link")).toBe(true);

    const padSuggestions = buildShopSearchSuggestions({
      scopedItems: indexed,
      allIndexedItems: indexed,
      rawQuery: "pad",
    });
    expect(padSuggestions.keywords.some((kw) => kw.label.toLowerCase().startsWith("pad"))).toBe(
      true,
    );
    expect(
      padSuggestions.products.every((p) => {
        const text =
          `${p.product.name} ${p.product.sku} ${p.product.description} ${(p.product.features || []).join(" ")} ${(p.product.fits || []).join(" ")} ${p.product.specs.flat().join(" ")} ${(p.product.highlights || []).flat().join(" ")}`.toLowerCase();
        return text.includes("pad");
      }),
    ).toBe(true);
  });

  it("handles SKUs, compact queries, and multi-word completions", () => {
    const skuExact = searchIndexedProducts(indexed, "LAUNCH-PAD9-LINK");
    expect(skuExact[0]?.item.product.slug).toBe("launch-x-431-pad9-link");

    const compact = searchIndexedProducts(indexed, "pad9");
    expect(compact.some((m) => m.item.product.slug === "launch-x-431-pad9-link")).toBe(true);

    const multiWord = searchIndexedProducts(indexed, "battery balancer");
    expect(multiWord.length).toBeGreaterThanOrEqual(2);
    expect(multiWord[0]?.item.product.slug).toMatch(/^launch-evb6/);
    expect(multiWord[1]?.item.product.slug).toMatch(/^launch-evb6/);

    const multiWordSuggestions = buildShopSearchSuggestions({
      scopedItems: indexed,
      allIndexedItems: indexed,
      rawQuery: "battery b",
    });
    // Should complete trailing token without repeating "battery"
    for (const kw of multiWordSuggestions.keywords) {
      expect(kw.label.toLowerCase()).not.toContain("battery battery");
    }
  });

  it("highlights word-start prefix matches cleanly for short queries", () => {
    const segs = splitHighlightSegments("Heavy-Duty Hydraulic Lift with Lock", "h");
    const highlightedTexts = segs.filter((s) => s.highlighted).map((s) => s.text);
    expect(highlightedTexts).toEqual(["H", "H"]);
    expect(segs.map((s) => s.text).join("")).toBe("Heavy-Duty Hydraulic Lift with Lock");
  });
});
