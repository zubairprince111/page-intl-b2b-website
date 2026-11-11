import type { Product } from "./data";

export interface IndexedProduct {
  product: Product;
  nameLower: string;
  nameNormalized: string;
  nameWords: string[];
  skuLower: string;
  skuWords: string[];
  skuCompact: string;
  brandLower: string;
  brandWords: string[];
  categoryLower: string;
  categoryWords: string[];
  subcategoryWords: string[];
  mobilityWords: string[];
  fitWords: string[];
  secondaryWords: string[];
  descriptionWords: string[];
  allCompact: string;
  searchCandidateTerms: string[];
}

export interface ParsedSearchQuery {
  raw: string;
  normalized: string;
  compact: string;
  tokens: string[];
}

export type ShopSuggestionItem =
  | {
      kind: "keyword";
      id: string;
      label: string;
      matchCount: number;
    }
  | {
      kind: "category";
      id: string;
      label: string;
      matchCount: number;
    }
  | {
      kind: "brand";
      id: string;
      label: string;
      matchCount: number;
    }
  | {
      kind: "product";
      id: string;
      product: Product;
      score: number;
    };

export interface ShopSearchSuggestionsResult {
  keywords: Array<Extract<ShopSuggestionItem, { kind: "keyword" | "category" | "brand" }>>;
  products: Array<Extract<ShopSuggestionItem, { kind: "product" }>>;
  totalProductMatches: number;
  usedCatalogFallback: boolean;
}

const STOP_WORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "into",
  "per",
  "all",
  "use",
  "bay",
  "set",
  "pack",
  "case",
  "pair",
  "kit",
  "system",
  "station",
  "commercial",
  "grade",
]);

/**
 * Extracts normalized lowercase tokens from arbitrary product strings.
 * Preserves hyphenated compounds (e.g. "heavy-duty") AND their split parts ("heavy", "duty")
 * plus alphanumeric tokens (e.g. "2-post" -> "2", "post").
 */
export function extractSearchTokens(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const seen = new Set<string>();

  const spaceSplit = lower.split(/[\s/,&()[\]"'“”‘’•|:+]+/);
  for (const raw of spaceSplit) {
    const cleaned = raw.replace(/^[-–—.]+|[-–—.]+$/g, "");
    if (cleaned) {
      seen.add(cleaned);
    }
  }

  const alnumSplit = lower.split(/[^a-z0-9]+/);
  for (const part of alnumSplit) {
    if (part) {
      seen.add(part);
    }
  }

  return Array.from(seen);
}

/**
 * Extracts display-friendly meaningful terms (e.g. "Heavy-Duty", "Hydraulic", "High-Voltage")
 * from product names for live autocomplete suggestions.
 */
function extractDisplayTermsFromName(name: string): string[] {
  const results: string[] = [];
  const seenLower = new Set<string>();
  const rawParts = name.split(/[\s/,&()[\]"'“”‘’]+/);

  for (const part of rawParts) {
    const cleaned = part.replace(/^[-–—.:]+|[-–—.:]+$/g, "");
    if (!cleaned || cleaned.length < 2) continue;
    const lower = cleaned.toLowerCase();
    if (STOP_WORDS.has(lower)) continue;
    if (/^\d+$/.test(lower)) continue;
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      results.push(cleaned);
    }
    if (cleaned.includes("-")) {
      for (const sub of cleaned.split("-")) {
        if (sub.length >= 3 && !STOP_WORDS.has(sub.toLowerCase())) {
          const subLower = sub.toLowerCase();
          if (!seenLower.has(subLower)) {
            seenLower.add(subLower);
            results.push(sub);
          }
        }
      }
    }
  }

  return results;
}

export function normalizeSearchPhrase(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      raw: "",
      normalized: "",
      compact: "",
      tokens: [],
    };
  }
  const normalized = normalizeSearchPhrase(trimmed);
  const compact = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tokens = normalized ? normalized.split(/\s+/).filter(Boolean) : [];
  return {
    raw: trimmed,
    normalized,
    compact,
    tokens,
  };
}

export function buildProductSearchIndex(catalog: readonly Product[]): IndexedProduct[] {
  return catalog.map((product) => {
    const nameLower = product.name.toLowerCase();
    const nameNormalized = normalizeSearchPhrase(product.name);
    const nameWords = extractSearchTokens(product.name);
    const skuLower = product.sku.toLowerCase();
    const skuWords = extractSearchTokens(product.sku);
    const skuCompact = skuLower.replace(/[^a-z0-9]/g, "");
    const brandLower = product.brand.toLowerCase();
    const brandWords = extractSearchTokens(product.brand);
    const categoryLower = product.category.toLowerCase();
    const categoryWords = extractSearchTokens(product.category);
    const subcategoryWords = extractSearchTokens(product.subcategory || "");
    const mobilityWords = extractSearchTokens((product.mobility || []).join(" "));

    const fitWords = extractSearchTokens((product.fits || []).join(" "));
    const specText = (product.specs || []).map(([k, v]) => `${k} ${v}`).join(" ");
    const highlightText = (product.highlights || []).map(([k, v]) => `${k} ${v}`).join(" ");
    const featureText = (product.features || []).join(" ");
    const secondaryWords = extractSearchTokens(
      `${(product.fits || []).join(" ")} ${featureText} ${specText} ${highlightText}`,
    );
    const descriptionWords = extractSearchTokens(product.description || "");

    const allCompact = [nameLower, skuLower, brandLower, categoryLower]
      .join("")
      .replace(/[^a-z0-9]/g, "");

    const searchCandidateTerms = extractDisplayTermsFromName(product.name);

    return {
      product,
      nameLower,
      nameNormalized,
      nameWords,
      skuLower,
      skuWords,
      skuCompact,
      brandLower,
      brandWords,
      categoryLower,
      categoryWords,
      subcategoryWords,
      mobilityWords,
      fitWords,
      secondaryWords,
      descriptionWords,
      allCompact,
      searchCandidateTerms,
    };
  });
}

function scoreSingleToken(item: IndexedProduct, token: string): number {
  let best = 0;

  if (item.skuLower === token || item.skuCompact === token) {
    best = Math.max(best, 220);
  }
  if (
    item.skuLower.startsWith(token) ||
    item.skuCompact.startsWith(token) ||
    item.skuWords.some((w) => w.startsWith(token))
  ) {
    best = Math.max(best, 115);
  }

  for (let i = 0; i < item.nameWords.length; i++) {
    const word = item.nameWords[i];
    if (!word) continue;
    if (word === token) {
      best = Math.max(best, i === 0 ? 150 : 125);
    } else if (word.startsWith(token)) {
      best = Math.max(best, i === 0 ? 135 : 105);
    }
  }

  if (item.brandLower === token) {
    best = Math.max(best, 100);
  } else if (
    item.brandLower.startsWith(token) ||
    item.brandWords.some((w) => w.startsWith(token))
  ) {
    best = Math.max(best, 85);
  }

  if (item.categoryLower.startsWith(token) || item.categoryWords.some((w) => w.startsWith(token))) {
    best = Math.max(best, 75);
  }

  if (
    item.subcategoryWords.some((w) => w.startsWith(token)) ||
    item.mobilityWords.some((w) => w.startsWith(token))
  ) {
    best = Math.max(best, 65);
  }

  // Single-character queries ("h") stay strictly on high-signal word prefixes (+ fitment makes like Honda/Hino)
  // so generic words like "with" or "the" inside descriptions do not pollute results.
  if (token.length === 1) {
    if (item.fitWords.some((w) => w.startsWith(token))) {
      best = Math.max(best, 40);
    }
    return best;
  }

  // 2+ character queries ("he", "ob", "40", etc.) also match specs, highlights, features, fits, and description word starts.
  if (item.secondaryWords.some((w) => w.startsWith(token))) {
    best = Math.max(best, 50);
  }
  if (item.descriptionWords.some((w) => w.startsWith(token))) {
    best = Math.max(best, 25);
  }

  // Substring / SKU middle / compact spec search for 3+ character queries (e.g. "4000", "5w30", "lift")
  if (best === 0 && token.length >= 3) {
    if (
      item.nameNormalized.includes(token) ||
      item.skuLower.includes(token) ||
      item.skuCompact.includes(token) ||
      item.allCompact.includes(token)
    ) {
      best = 30;
    } else if (
      item.brandLower.includes(token) ||
      item.categoryLower.includes(token) ||
      item.secondaryWords.some((w) => w.includes(token))
    ) {
      best = 20;
    }
  }

  return best;
}

export function scoreIndexedProduct(item: IndexedProduct, parsedQuery: ParsedSearchQuery): number {
  if (parsedQuery.tokens.length === 0) return 1;

  let totalScore = 0;

  for (const token of parsedQuery.tokens) {
    const tokenScore = scoreSingleToken(item, token);
    if (tokenScore === 0) {
      return 0;
    }
    totalScore += tokenScore;
  }

  // Full query prefix / phrase boost
  if (parsedQuery.normalized && item.nameNormalized.startsWith(parsedQuery.normalized)) {
    totalScore += 140;
  } else if (
    parsedQuery.tokens.length > 1 &&
    parsedQuery.normalized &&
    item.nameNormalized.includes(parsedQuery.normalized)
  ) {
    totalScore += 55;
  }

  if (parsedQuery.compact.length >= 3 && item.skuCompact.includes(parsedQuery.compact)) {
    totalScore += 90;
  }

  return totalScore;
}

function stockRankWeight(stock: Product["stock"]): number {
  if (stock === "In stock") return 2;
  if (stock === "Low stock") return 1;
  return 0;
}

export function searchIndexedProducts(
  indexedItems: readonly IndexedProduct[],
  rawQuery: string,
): Array<{ item: IndexedProduct; score: number }> {
  const parsedQuery = parseSearchQuery(rawQuery);
  if (parsedQuery.tokens.length === 0) {
    return indexedItems.map((item) => ({ item, score: 1 }));
  }

  const matches: Array<{ item: IndexedProduct; score: number }> = [];
  for (const item of indexedItems) {
    const score = scoreIndexedProduct(item, parsedQuery);
    if (score > 0) {
      matches.push({ item, score });
    }
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const stockDiff = stockRankWeight(b.item.product.stock) - stockRankWeight(a.item.product.stock);
    if (stockDiff !== 0) return stockDiff;
    return a.item.product.name.localeCompare(b.item.product.name);
  });

  return matches;
}

function toDomIdSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatQuickSuggestions(
  scopedItems: readonly IndexedProduct[],
  allIndexedItems: readonly IndexedProduct[],
  maxKeywords: number,
  maxProducts: number,
): ShopSearchSuggestionsResult {
  const sourceItems = scopedItems.length > 0 ? scopedItems : allIndexedItems;
  const catCounts = new Map<string, number>();
  for (const item of sourceItems) {
    const cat = item.product.category;
    if (cat) {
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    }
  }

  const keywords: ShopSearchSuggestionsResult["keywords"] = Array.from(catCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([label, matchCount]) => ({
      kind: "category" as const,
      id: `quick-cat-${toDomIdSlug(label)}`,
      label,
      matchCount,
    }));

  const products: ShopSearchSuggestionsResult["products"] = sourceItems
    .slice(0, maxProducts)
    .map((item, idx) => ({
      kind: "product" as const,
      id: `quick-prod-${item.product.slug}`,
      product: item.product,
      score: sourceItems.length - idx,
    }));

  return {
    keywords,
    products,
    totalProductMatches: sourceItems.length,
    usedCatalogFallback: scopedItems.length === 0 && allIndexedItems.length > 0,
  };
}

export function buildShopSearchSuggestions(params: {
  scopedItems: readonly IndexedProduct[];
  allIndexedItems: readonly IndexedProduct[];
  rawQuery: string;
  maxKeywords?: number;
  maxProducts?: number;
}): ShopSearchSuggestionsResult {
  const maxKeywords = params.maxKeywords ?? 5;
  const maxProducts = params.maxProducts ?? 6;
  const parsed = parseSearchQuery(params.rawQuery);

  if (parsed.tokens.length === 0) {
    return formatQuickSuggestions(
      params.scopedItems,
      params.allIndexedItems,
      maxKeywords,
      Math.min(maxProducts, 4),
    );
  }

  let matched = searchIndexedProducts(params.scopedItems, params.rawQuery);
  let usedCatalogFallback = false;

  if (matched.length === 0 && params.scopedItems.length !== params.allIndexedItems.length) {
    matched = searchIndexedProducts(params.allIndexedItems, params.rawQuery);
    usedCatalogFallback = matched.length > 0;
  }

  const suggestionItems: ShopSearchSuggestionsResult["keywords"] = [];
  const seenNormalizedLabels = new Set<string>();
  const hasTrailingSpace = /\s$/.test(params.rawQuery);
  const lastToken = hasTrailingSpace ? "" : (parsed.tokens[parsed.tokens.length - 1] ?? "");
  const precedingPhrase = hasTrailingSpace
    ? parsed.tokens.join(" ")
    : parsed.tokens.slice(0, -1).join(" ");
  const isMultiWordContext = parsed.tokens.length > 1 || hasTrailingSpace;
  const queryNormLower = parsed.normalized;

  // 1. Matching categories
  const categoryStats = new Map<string, { label: string; count: number; score: number }>();
  // 2. Matching brands
  const brandStats = new Map<string, { label: string; count: number; score: number }>();
  // 3. Matching product terms / phrase completions (e.g. "Heavy-Duty", "Hydraulic", "Heavy Lift")
  const termStats = new Map<string, { label: string; count: number; score: number }>();

  for (const { item } of matched) {
    const cat = item.product.category;
    if (cat) {
      const catNorm = normalizeSearchPhrase(cat);
      const catTokens = extractSearchTokens(cat);
      const catPrefixMatch =
        catNorm.startsWith(queryNormLower) ||
        (lastToken.length > 0 && catTokens.some((w) => w.startsWith(lastToken)));
      if (catPrefixMatch && catNorm !== queryNormLower) {
        const entry = categoryStats.get(catNorm) ?? {
          label: cat,
          count: 0,
          score: catNorm.startsWith(queryNormLower) ? 120 : 85,
        };
        entry.count += 1;
        categoryStats.set(catNorm, entry);
      }
    }

    const brand = item.product.brand;
    if (brand) {
      const brandNorm = normalizeSearchPhrase(brand);
      const brandTokens = extractSearchTokens(brand);
      const brandPrefixMatch =
        brandNorm.startsWith(queryNormLower) ||
        (lastToken.length > 0 && brandTokens.some((w) => w.startsWith(lastToken)));
      if (brandPrefixMatch && brandNorm !== queryNormLower) {
        const entry = brandStats.get(brandNorm) ?? {
          label: brand,
          count: 0,
          score: brandNorm.startsWith(queryNormLower) ? 115 : 80,
        };
        entry.count += 1;
        brandStats.set(brandNorm, entry);
      }
    }

    const perProductSeenTerm = new Set<string>();
    for (const term of item.searchCandidateTerms) {
      const termLower = term.toLowerCase();
      const termNorm = normalizeSearchPhrase(term);
      if (!termNorm || termNorm === queryNormLower) {
        continue;
      }

      if (isMultiWordContext && precedingPhrase) {
        // Avoid repeating words/fragments already present in the preceding phrase
        const precedingTokens = new Set(precedingPhrase.split(" "));
        const termSubTokens = termNorm.split(" ");
        if (termSubTokens.some((sub) => precedingTokens.has(sub))) continue;
      }

      const subParts = termLower.split("-");
      let matchesTerm = false;
      let termScore = 60;

      if (!isMultiWordContext) {
        const startsWithQuery =
          termLower.startsWith(queryNormLower) || termNorm.startsWith(queryNormLower);
        const startsWithLastToken =
          lastToken.length > 0 &&
          (termLower.startsWith(lastToken) || subParts.some((p) => p.startsWith(lastToken)));
        matchesTerm = startsWithQuery || startsWithLastToken;
        termScore = startsWithQuery ? 105 : termLower.startsWith(lastToken) ? 90 : 65;
      } else if (hasTrailingSpace) {
        // Next-word completion after a completed token + space
        matchesTerm = true;
        termScore = 75;
      } else {
        // Complete partial last token inside a multi-word query
        matchesTerm =
          lastToken.length > 0 &&
          (termLower.startsWith(lastToken) || subParts.some((p) => p.startsWith(lastToken)));
        termScore = termLower.startsWith(lastToken) ? 95 : 70;
      }

      if (!matchesTerm) continue;

      const suggestedLabel =
        isMultiWordContext && precedingPhrase ? `${precedingPhrase} ${term}` : term;
      const suggestedNorm = normalizeSearchPhrase(suggestedLabel);
      if (
        !suggestedNorm ||
        suggestedNorm === queryNormLower ||
        perProductSeenTerm.has(suggestedNorm)
      ) {
        continue;
      }
      perProductSeenTerm.add(suggestedNorm);

      const existing = termStats.get(suggestedNorm);
      if (existing) {
        existing.count += 1;
        if (suggestedLabel.includes("-") && !existing.label.includes("-")) {
          existing.label = suggestedLabel;
        }
      } else {
        termStats.set(suggestedNorm, {
          label: suggestedLabel,
          count: 1,
          score: termScore,
        });
      }
    }
  }

  const combinedCandidates: Array<{
    item: ShopSearchSuggestionsResult["keywords"][number];
    score: number;
  }> = [
    ...Array.from(categoryStats.values()).map((info) => ({
      item: {
        kind: "category" as const,
        id: `cat-${toDomIdSlug(info.label)}`,
        label: info.label,
        matchCount: info.count,
      },
      score: info.score + info.count * 2,
    })),
    ...Array.from(brandStats.values()).map((info) => ({
      item: {
        kind: "brand" as const,
        id: `brand-${toDomIdSlug(info.label)}`,
        label: info.label,
        matchCount: info.count,
      },
      score: info.score + info.count * 2,
    })),
    ...Array.from(termStats.values()).map((info) => ({
      item: {
        kind: "keyword" as const,
        id: `kw-${toDomIdSlug(info.label)}`,
        label: info.label,
        matchCount: info.count,
      },
      score: info.score + Math.min(info.count, 10) * 3,
    })),
  ];

  combinedCandidates.sort(
    (a, b) =>
      b.score - a.score ||
      b.item.matchCount - a.item.matchCount ||
      a.item.label.length - b.item.label.length,
  );

  for (const candidate of combinedCandidates) {
    const key = candidate.item.label.toLowerCase();
    if (seenNormalizedLabels.has(key)) continue;
    seenNormalizedLabels.add(key);
    suggestionItems.push(candidate.item);
    if (suggestionItems.length >= maxKeywords) break;
  }

  const productSuggestions: ShopSearchSuggestionsResult["products"] = matched
    .slice(0, maxProducts)
    .map(({ item, score }) => ({
      kind: "product" as const,
      id: `prod-${item.product.slug}`,
      product: item.product,
      score,
    }));

  return {
    keywords: suggestionItems,
    products: productSuggestions,
    totalProductMatches: matched.length,
    usedCatalogFallback,
  };
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Splits display text into highlighted and non-highlighted segments for autocomplete labels.
 * Short tokens (1-2 chars) highlight strictly at word boundaries so "h" highlights "Heavy" not "wit[h]".
 */
export function splitHighlightSegments(text: string, rawQuery: string): HighlightSegment[] {
  const { tokens } = parseSearchQuery(rawQuery);
  if (!text || tokens.length === 0) {
    return [{ text, highlighted: false }];
  }

  const sortedTokens = Array.from(new Set(tokens)).sort((a, b) => b.length - a.length);
  const ranges: Array<[number, number]> = [];
  const lowerText = text.toLowerCase();

  for (const token of sortedTokens) {
    let searchFrom = 0;
    while (searchFrom < lowerText.length) {
      const idx = lowerText.indexOf(token, searchFrom);
      if (idx === -1) break;

      const prevChar = idx > 0 ? lowerText[idx - 1] : "";
      const isWordStart = idx === 0 || !/[a-z0-9]/.test(prevChar || "");
      if (token.length >= 3 || isWordStart) {
        ranges.push([idx, idx + token.length]);
      }
      searchFrom = idx + 1;
    }
  }

  if (ranges.length === 0) {
    return [{ text, highlighted: false }];
  }

  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const prev = merged[merged.length - 1];
    if (!prev || range[0] > prev[1]) {
      merged.push([range[0], range[1]]);
    } else if (range[1] > prev[1]) {
      prev[1] = range[1];
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: text.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
}
