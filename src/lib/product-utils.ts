export type SpecTuple = [string, string];
export type SpecsInput = Record<string, string> | SpecTuple[] | null | undefined;
export type ProductStockLabel = "In stock" | "Low stock" | "Out of stock";

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
