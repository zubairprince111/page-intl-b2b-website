import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { brands, products } from "@/lib/data";
import { atsElgiProducts } from "@/lib/ats-elgi-products";
import { buildProductSearchIndex, searchIndexedProducts } from "@/lib/shop-search";

describe("ATS ELGI Full Lift Catalog & Workable Filters", () => {
  it("includes both LAUNCH and ATS ELGI in the active brands list", () => {
    expect(brands).toContain("LAUNCH");
    expect(brands).toContain("ATS ELGI");
  });

  it("exports all 13 ATS ELGI washing, 2W, 3W, 4W & EV lifts in the master products catalog", () => {
    const atsProductsInCatalog = products.filter((p) => p.brand === "ATS ELGI");
    expect(atsProductsInCatalog.length).toBe(13);

    const expectedSlugs = [
      "ats-elgi-washing-hoist-4-wheeler-rail-type",
      "ats-elgi-washing-hoist-4-wheeler-ramp-type",
      "ats-elgi-washing-hoist-8-ton-rail-type",
      "ats-elgi-washing-hoist-16-ton-rail-type",
      "ats-elgi-two-wheeler-washing-lift",
      "ats-elgi-smartwash-duo",
      "ats-elgi-mobile-column-lift",
      "ats-elgi-two-wheeler-service-lift",
      "ats-elgi-two-wheeler-lift-hydraulic",
      "ats-elgi-3w-two-post-hydraulic-lift",
      "ats-elgi-two-wheeler-lift-400-kg-big-bike-lift",
      "ats-elgi-ev-battery-lift",
      "ats-elgi-3w-single-column-lift",
    ];

    for (const slug of expectedSlugs) {
      const prod = products.find((p) => p.slug === slug);
      expect(prod, `Expected product with slug ${slug}`).toBeDefined();
      expect(prod?.brand).toBe("ATS ELGI");
      expect(prod?.specs.length).toBeGreaterThan(4);
      expect(prod?.features?.length).toBeGreaterThan(3);
    }
  });

  it("verifies all ATS ELGI product images exist locally on disk", () => {
    for (const prod of atsElgiProducts) {
      const relativePath = prod.image.replace(/^\//, "");
      const fullPath = path.resolve(process.cwd(), "public", relativePath.replace(/^public\//, ""));
      expect(fs.existsSync(fullPath), `Missing image ${fullPath}`).toBe(true);

      if (prod.images) {
        for (const img of prod.images) {
          const imgRel = img.replace(/^\//, "");
          const imgFull = path.resolve(process.cwd(), "public", imgRel.replace(/^public\//, ""));
          expect(fs.existsSync(imgFull), `Missing gallery image ${imgFull}`).toBe(true);
        }
      }
    }
  });

  it("filters ATS ELGI products correctly across 2W, 3W, 4W, and EV mobility segments", () => {
    const atsOnly = products.filter((p) => p.brand === "ATS ELGI");
    expect(atsOnly.length).toBe(13);

    const twoWheelerLifts = atsOnly.filter((p) => p.mobility.includes("2-Wheeler"));
    expect(twoWheelerLifts.length).toBe(5);

    const threeWheelerLifts = atsOnly.filter((p) => p.mobility.includes("3-Wheeler"));
    expect(threeWheelerLifts.length).toBe(2);
    expect(threeWheelerLifts.some((p) => p.slug === "ats-elgi-3w-two-post-hydraulic-lift")).toBe(true);
    expect(threeWheelerLifts.some((p) => p.slug === "ats-elgi-3w-single-column-lift")).toBe(true);

    const fourWheelerLifts = atsOnly.filter((p) => p.mobility.includes("4-Wheeler"));
    expect(fourWheelerLifts.length).toBe(6);
    expect(fourWheelerLifts.some((p) => p.slug === "ats-elgi-mobile-column-lift")).toBe(true);

    const evLifts = atsOnly.filter((p) => p.mobility.includes("EV"));
    expect(evLifts.some((p) => p.slug === "ats-elgi-ev-battery-lift")).toBe(true);
  });

  it("indexes and surfaces new ATS ELGI lifts via search terms", () => {
    const index = buildProductSearchIndex(products);

    const mobileColumnResults = searchIndexedProducts(index, "ML4030");
    expect(mobileColumnResults.some((r) => r.item.product.slug === "ats-elgi-mobile-column-lift")).toBe(true);

    const bigBikeResults = searchIndexedProducts(index, "Big Bike Lift 400");
    expect(bigBikeResults.some((r) => r.item.product.slug === "ats-elgi-two-wheeler-lift-400-kg-big-bike-lift")).toBe(true);

    const evBatResults = searchIndexedProducts(index, "EV Battery Lift");
    expect(evBatResults.some((r) => r.item.product.slug === "ats-elgi-ev-battery-lift")).toBe(true);
  });

  it("includes all 23 LAUNCH China vehicle lifts from en.cnlaunch.com/products/c-9.html with local images", () => {
    const launchLifts = products.filter(
      (p) => p.brand === "LAUNCH" && p.subcategory === "Vehicle Lifts & Hoists",
    );
    expect(launchLifts.length).toBe(23);

    for (const lift of launchLifts) {
      const relativePath = lift.image.split("?")[0]!.replace(/^\//, "");
      const fullPath = path.resolve(process.cwd(), "public", relativePath.replace(/^public\//, ""));
      expect(fs.existsSync(fullPath), `Missing LAUNCH lift image ${fullPath}`).toBe(true);
      expect(lift.specs.length).toBeGreaterThanOrEqual(8);
    }
  });
});
