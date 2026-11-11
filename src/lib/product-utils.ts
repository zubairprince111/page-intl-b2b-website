export type SpecTuple = [string, string];
export type SpecsInput = Record<string, string> | SpecTuple[] | null | undefined;
export type ProductStockLabel = "In stock" | "Low stock" | "Out of stock";

export interface ProductVariantGroup {
  name: string;
  options: string[];
}

export interface ProductGuaranteeBadge {
  title: string;
  subtitle: string;
}

export interface ProductLikeRow {
  slug: string;
  sku?: string | null | undefined;
  name: string;
  brand: string;
  category: string;
  subcategory?: string | null | undefined;
  mobility?: string[] | null | undefined;
  isEquipment?: boolean | null | undefined;
  requiresQuote?: boolean | null | undefined;
  priceBdt?: number | null | undefined;
  price?: number | null | undefined;
  inStock?: boolean | null | undefined;
  warehouseQty?: number | null | undefined;
  reorderLevel?: number | null | undefined;
  badge?: string | null | undefined;
  description: string;
  specs?: SpecsInput;
  highlights?: SpecTuple[] | null | undefined;
  variantOptions?: ProductVariantGroup[] | null | undefined;
  guarantees?: ProductGuaranteeBadge[] | null | undefined;
  dispatchHub?: string | null | undefined;
  priceLabel?: string | null | undefined;
  features?: string[] | null | undefined;
  images?: string[] | null | undefined;
  image?: string | null | undefined;
  fits?: string[] | null | undefined;
}

const EQUIPMENT_CATEGORIES = new Set([
  "Garage Equipment",
  "Tyre & Wheel",
  "Diagnostic Equipment",
  "EV Equipment",
]);

export function inferIsEquipment(category: string): boolean {
  return EQUIPMENT_CATEGORIES.has((category || "").trim());
}

/**
 * Normalizes technical specifications stored either as an ordered tuple list
 * (`[key, value][]`) or a plain object (`Record<string, string>`) into clean,
 * trimmed `[key, value][]` tuples.
 */
export function normalizeSpecsToTuples(specs: SpecsInput): SpecTuple[] {
  if (!specs) return [];

  if (Array.isArray(specs)) {
    const result: SpecTuple[] = [];
    for (const entry of specs) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const key = String(entry[0] ?? "").trim();
      const value = String(entry[1] ?? "").trim();
      if (!key) continue;
      result.push([key, value]);
    }
    return result;
  }

  if (typeof specs === "object") {
    const result: SpecTuple[] = [];
    for (const [rawKey, rawVal] of Object.entries(specs)) {
      const key = String(rawKey ?? "").trim();
      const value = String(rawVal ?? "").trim();
      if (!key) continue;
      result.push([key, value]);
    }
    return result;
  }

  return [];
}

/**
 * Normalizes `{ key, value }[]` editor rows into clean `[string, string][]` tuples.
 */
export function sanitizeSpecRows(rows: { key: string; value: string }[]): SpecTuple[] {
  const result: SpecTuple[] = [];
  for (const row of rows) {
    const key = (row.key || "").trim();
    const value = (row.value || "").trim();
    if (!key) continue;
    result.push([key, value]);
  }
  return result;
}

/**
 * Parses pasted multi-line technical specification text (`Key: Value`,
 * `Key = Value`, `Key - Value`, or tab-separated `Key\tValue`) into spec tuples.
 */
export function parseSpecsText(raw: string): SpecTuple[] {
  if (!raw) return [];
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: SpecTuple[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-*•]\s*/, "");
    let sepIdx = cleaned.indexOf(":");
    let sepLen = 1;

    if (sepIdx === -1) {
      const tabIdx = cleaned.indexOf("\t");
      if (tabIdx !== -1) {
        sepIdx = tabIdx;
        sepLen = 1;
      }
    }
    if (sepIdx === -1) {
      const eqIdx = cleaned.indexOf("=");
      if (eqIdx !== -1) {
        sepIdx = eqIdx;
        sepLen = 1;
      }
    }
    if (sepIdx === -1) {
      const dashMatch = cleaned.match(/\s+[-–—]\s+/);
      if (dashMatch && dashMatch.index !== undefined) {
        sepIdx = dashMatch.index;
        sepLen = dashMatch[0].length;
      }
    }

    if (sepIdx > 0) {
      const key = cleaned.slice(0, sepIdx).trim();
      const value = cleaned.slice(sepIdx + sepLen).trim();
      if (key) {
        result.push([key, value]);
      }
    }
  }
  return result;
}

export function sanitizeFeatureLines(features: string[]): string[] {
  return features.map((f) => f.trim()).filter((f) => f.length > 0);
}

export function parseFitsText(raw: string): string[] {
  return raw
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function deriveProductStockStatus(opts: {
  inStock?: boolean | null | undefined;
  warehouseQty?: number | null | undefined;
  reorderLevel?: number | null | undefined;
}): ProductStockLabel {
  const qty = opts.warehouseQty ?? 10;
  const reorder = opts.reorderLevel ?? 2;
  if (opts.inStock === false || qty <= 0) return "Out of stock";
  if (qty <= reorder) return "Low stock";
  return "In stock";
}

/**
 * Legacy seeds copied `fits` into `features`. Filter out identical copies so
 * fitment strings are not mislabeled as product highlights.
 */
export function getDistinctProductFeatures(
  features: string[] | null | undefined,
  fits: string[] | null | undefined,
): string[] {
  const cleanFeatures = sanitizeFeatureLines(Array.isArray(features) ? features : []);
  if (cleanFeatures.length === 0) return [];
  const cleanFits = sanitizeFeatureLines(Array.isArray(fits) ? fits : []);
  if (
    cleanFits.length === cleanFeatures.length &&
    cleanFeatures.every((val, idx) => val === cleanFits[idx])
  ) {
    return [];
  }
  return cleanFeatures;
}

/**
 * Resolves spec tuples while preserving canonical fallback ordering for
 * legacy JSONB-object rows that match static seed keys/values unchanged.
 */
export function resolveOrderedSpecs(
  dbSpecs: SpecsInput,
  fallbackSpecs?: SpecTuple[] | undefined,
): SpecTuple[] {
  if (Array.isArray(dbSpecs)) {
    return normalizeSpecsToTuples(dbSpecs);
  }

  const normalized = normalizeSpecsToTuples(dbSpecs);
  if (normalized.length === 0) {
    return fallbackSpecs ? [...fallbackSpecs] : [];
  }

  if (fallbackSpecs && fallbackSpecs.length === normalized.length) {
    const dbMap = new Map(normalized);
    const matchesAllFallback = fallbackSpecs.every(([k, v]) => dbMap.get(k) === v);
    if (matchesAllFallback) {
      return [...fallbackSpecs];
    }
  }

  return normalized;
}

/**
 * Sanitizes highlight tuples `[label, detail]` allowing either both parts
 * (e.g. `Lifting Capacity: 4,000 kg`) or single-string highlights (`["", "..."]`).
 */
export function sanitizeHighlightRows(rows: { key: string; value: string }[]): SpecTuple[] {
  const result: SpecTuple[] = [];
  for (const row of rows) {
    const key = (row.key || "").trim();
    const value = (row.value || "").trim();
    if (!key && !value) continue;
    result.push([key, value]);
  }
  return result;
}

export function sanitizeHighlightTuples(highlights: SpecTuple[] | null | undefined): SpecTuple[] {
  if (!Array.isArray(highlights)) return [];
  const result: SpecTuple[] = [];
  for (const entry of highlights) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const key = String(entry[0] ?? "").trim();
    const value = String(entry[1] ?? "").trim();
    if (!key && !value) continue;
    result.push([key, value]);
  }
  return result;
}

export function sanitizeVariantGroups(
  groups: ProductVariantGroup[] | null | undefined,
): ProductVariantGroup[] {
  if (!Array.isArray(groups)) return [];
  const result: ProductVariantGroup[] = [];
  for (const group of groups) {
    const name = String(group?.name ?? "").trim();
    const rawOpts = Array.isArray(group?.options) ? group.options : [];
    const options = Array.from(
      new Set(rawOpts.map((opt) => String(opt ?? "").trim()).filter((opt) => opt.length > 0)),
    );
    if (!name || options.length === 0) continue;
    result.push({ name, options });
  }
  return result;
}

export function sanitizeGuaranteeBadges(
  badges: ProductGuaranteeBadge[] | null | undefined,
): ProductGuaranteeBadge[] {
  if (!Array.isArray(badges)) return [];
  const result: ProductGuaranteeBadge[] = [];
  for (const item of badges) {
    const title = String(item?.title ?? "").trim();
    const subtitle = String(item?.subtitle ?? "").trim();
    if (!title && !subtitle) continue;
    result.push({ title, subtitle });
  }
  return result;
}

export function parseGuaranteeFromWarrantySpec(warrantyText: string): ProductGuaranteeBadge | null {
  const clean = (warrantyText || "").trim();
  if (!clean) return null;
  if (/lifetime/i.test(clean)) {
    return { title: "Lifetime", subtitle: "Forging Warranty" };
  }
  const monthMatch = clean.match(/(\d+)\s*month/i);
  if (monthMatch?.[1]) {
    const months = Number(monthMatch[1]);
    if (months === 24) return { title: "2-Year", subtitle: "Parts Warranty" };
    if (months === 36) return { title: "3-Year", subtitle: "Manufacturer Warranty" };
    if (months > 0) return { title: `${months}-Month`, subtitle: "Commercial Warranty" };
  }
  const yearMatch = clean.match(/(\d+)\s*year/i);
  if (yearMatch?.[1]) {
    return { title: `${yearMatch[1]}-Year`, subtitle: "Commercial Warranty" };
  }
  return { title: "Included", subtitle: "Manufacturer Warranty" };
}

export function getDefaultProductPresentation(opts: {
  slug: string;
  category: string;
  isEquipment: boolean;
  requiresQuote: boolean;
  specs: SpecTuple[];
}): {
  highlights: SpecTuple[];
  variantOptions: ProductVariantGroup[];
  guarantees: ProductGuaranteeBadge[];
  dispatchHub: string;
  priceLabel: string;
} {
  const highlights = opts.specs.slice(0, 4);

  const variantOptions: ProductVariantGroup[] = [];
  const specJoined = opts.specs.map(([k, v]) => `${k} ${v}`).join(" ");
  const hasDualVoltage =
    opts.isEquipment &&
    (/220v\s*(or|\/)\s*380v/i.test(specJoined) || opts.slug === "heavy-duty-2-post-lift-4t");
  if (hasDualVoltage) {
    variantOptions.push({
      name: "Power & Voltage Supply",
      options: ["380V 3-Phase", "220V Single-Phase"],
    });
  }
  if (opts.isEquipment && opts.slug === "heavy-duty-2-post-lift-4t") {
    variantOptions.push({
      name: "Lifting Arm Configuration",
      options: ["Symmetric Telescopic Arms", "Asymmetric + EV Bay Arms"],
    });
  }

  const guarantees: ProductGuaranteeBadge[] = [
    { title: "2–4 Days", subtitle: "Fast Hub Dispatch" },
  ];
  const warrantySpec = opts.specs.find(([k]) => /warranty/i.test(k));
  const parsedWarranty = warrantySpec ? parseGuaranteeFromWarrantySpec(warrantySpec[1]) : null;
  if (parsedWarranty) {
    guarantees.push(parsedWarranty);
  }
  if (opts.slug.includes("ev-1000v")) {
    guarantees.push({ title: "IEC 60900", subtitle: "1000V VDE Certified" });
  } else if (opts.isEquipment) {
    guarantees.push({ title: "Certified", subtitle: "CE European Standard" });
  } else if (opts.category === "Lubricants & Fluids" || opts.category === "Brakes") {
    guarantees.push({ title: "Genuine Spec", subtitle: "Factory Sealed" });
  }

  return {
    highlights,
    variantOptions,
    guarantees,
    dispatchHub: "Dhaka Central Hub",
    priceLabel: "Pro-Forma B2B",
  };
}

export function normalizeStorefrontPriceLabel(rawPriceLabel: string | null | undefined): string {
  const trimmed = String(rawPriceLabel ?? "").trim();
  if (/^b2b unit price$/i.test(trimmed)) {
    return "Pro-Forma B2B";
  }
  return trimmed;
}

export function buildProductJsonLdOffers(product: {
  slug: string;
  stock: string;
}): Record<string, unknown> {
  return {
    "@type": "Offer",
    url: `https://page-bd.com/shop/${product.slug}`,
    availability:
      product.stock === "In stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    seller: {
      "@type": "Organization",
      name: "PAGE International Ltd.",
    },
  };
}

export function hasProductWarranty(opts: {
  guarantees?: ProductGuaranteeBadge[] | undefined;
  specs?: SpecTuple[] | undefined;
}): boolean {
  const inBadges = (opts.guarantees || []).some((g) =>
    /warranty/i.test(`${g.title} ${g.subtitle}`),
  );
  if (inBadges) return true;
  return (opts.specs || []).some(([k]) => /warranty/i.test(k));
}
