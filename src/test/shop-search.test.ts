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

  it('shows word-prefix suggestions under "h" without matching filler words like "with"', () => {
    const suggestions = buildShopSearchSuggestions({
      scopedItems: indexed,
      allIndexedItems: indexed,
      rawQuery: "h",
    });

    expect(suggestions.keywords.length).toBeGreaterThan(0);
    expect(suggestions.keywords.some((kw) => kw.label.toLowerCase().startsWith("h"))).toBe(true);
    expect(suggestions.products.length).toBeGreaterThan(0);

    // Every matching product under single-character "h" must have a genuine H-prefix word in primary/fitment fields
    const hMatches = searchIndexedProducts(indexed, "h");
    expect(hMatches.length).toBeGreaterThan(0);
    expect(hMatches.length).toBeLessThan(products.length);

    // Product whose title starts directly with "Heavy-Duty" must outrank secondary matches
    const topMatch = hMatches[0]?.item.product;
    expect(topMatch?.name.toLowerCase().startsWith("heavy")).toBe(true);

    // "Pro Automatic Tyre Changer with Dual Assist Arm" (only contains "with", no primary/fitment H-word) must not pollute "h"
    expect(hMatches.some((m) => m.item.product.slug === "pro-tyre-changer-assist-arm")).toBe(false);
  });

  it('narrows both suggestions and filtered product results cleanly when typing "he"', () => {
    const hMatches = searchIndexedProducts(indexed, "h");
    const heMatches = searchIndexedProducts(indexed, "he");

    expect(hMatches.some((m) => m.item.product.slug === "synthetic-engine-oil-0w20-4l")).toBe(true);
    expect(
      hMatches.some((m) => m.item.product.slug === "precision-3d-hd-wheel-alignment-system"),
    ).toBe(true);

    expect(heMatches.length).toBeGreaterThan(0);
    expect(heMatches.length).toBeLessThan(hMatches.length);

    // Non-"he" H-products (Hybrid, High-Definition) drop out cleanly when typing "he"
    expect(heMatches.some((m) => m.item.product.slug === "synthetic-engine-oil-0w20-4l")).toBe(
      false,
    );
    expect(
      heMatches.some((m) => m.item.product.slug === "precision-3d-hd-wheel-alignment-system"),
    ).toBe(false);
    expect(heMatches.some((m) => m.item.product.slug === "heavy-duty-2-post-lift-4t")).toBe(true);

    const heSuggestions = buildShopSearchSuggestions({
      scopedItems: indexed,
      allIndexedItems: indexed,
      rawQuery: "he",
    });
    expect(heSuggestions.keywords.some((kw) => kw.label.toLowerCase().startsWith("he"))).toBe(true);
    expect(
      heSuggestions.products.every((p) => {
        const text =
          `${p.product.name} ${p.product.description} ${p.product.specs.flat().join(" ")}`.toLowerCase();
        return text.includes("he");
      }),
    ).toBe(true);
  });

  it("handles SKUs, hyphenated specs (5W-30 / 2-Post), and multi-word completions", () => {
    const skuExact = searchIndexedProducts(indexed, "TQ-LIFT-4000");
    expect(skuExact[0]?.item.product.slug).toBe("heavy-duty-2-post-lift-4t");

    const oilCompact = searchIndexedProducts(indexed, "5w30");
    expect(oilCompact.some((m) => m.item.product.slug === "synthetic-engine-oil-5w30-4l")).toBe(
      true,
    );

    const multiWord = searchIndexedProducts(indexed, "heavy lift");
    expect(multiWord.length).toBeGreaterThanOrEqual(2);
    // Title-matched "Heavy-Duty ... Lift" items must rank ahead of spec-only matches
    expect(multiWord[0]?.item.product.slug).toMatch(/^heavy-duty-.*lift/);
    expect(multiWord[1]?.item.product.slug).toMatch(/^heavy-duty-.*lift/);

    const multiWordSuggestions = buildShopSearchSuggestions({
      scopedItems: indexed,
      allIndexedItems: indexed,
      rawQuery: "heavy l",
    });
    // Should complete trailing token without repeating "heavy"
    for (const kw of multiWordSuggestions.keywords) {
      expect(kw.label.toLowerCase()).not.toContain("heavy heavy");
    }
  });

  it("highlights word-start prefix matches cleanly for short queries", () => {
    const segs = splitHighlightSegments("Heavy-Duty Hydraulic Lift with Lock", "h");
    const highlightedTexts = segs.filter((s) => s.highlighted).map((s) => s.text);
    expect(highlightedTexts).toEqual(["H", "H"]);
    expect(segs.map((s) => s.text).join("")).toBe("Heavy-Duty Hydraulic Lift with Lock");
  });
});
