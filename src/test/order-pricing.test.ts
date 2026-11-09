import { describe, it, expect } from "vitest";
import { products } from "@/lib/data";

interface OrderLineInput {
  productSlug: string;
  quantity: number;
}

function calculateOrderTotals(items: OrderLineInput[]) {
  if (!items.length) {
    throw new Error("Order must contain at least one line item.");
  }

  let subtotal = 0;
  const verifiedLines = items.map((item) => {
    const product = products.find((p) => p.slug === item.productSlug);
    if (!product) {
      throw new Error(`Product not found: ${item.productSlug}`);
    }
    const qty = Math.max(1, Math.floor(item.quantity));
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    return {
      productSlug: product.slug,
      productName: product.name,
      unitPrice: product.price,
      quantity: qty,
      subtotal: lineTotal,
    };
  });

  // Commercial shipping calculation
  const shippingFee = subtotal >= 50000 ? 0 : 500;
  const total = subtotal + shippingFee;

  return { verifiedLines, subtotal, shippingFee, total };
}

describe("Zero-Trust Order Price Calculation", () => {
  it("computes accurate subtotal from verified product catalog", () => {
    const result = calculateOrderTotals([
      { productSlug: "heavy-duty-2-post-lift-4t", quantity: 1 },
      { productSlug: "ev-1000v-insulated-tool-kit", quantity: 2 },
    ]);

    const lift = products.find((p) => p.slug === "heavy-duty-2-post-lift-4t")!;
    const tools = products.find((p) => p.slug === "ev-1000v-insulated-tool-kit")!;

    expect(result.subtotal).toBe(lift.price * 1 + tools.price * 2);
    expect(result.shippingFee).toBe(0); // Subtotal exceeds 50,000 BDT
    expect(result.total).toBe(result.subtotal);
  });

  it("applies shipping fee for low value orders below threshold", () => {
    const result = calculateOrderTotals([{ productSlug: "bluetooth-obd-dongle", quantity: 1 }]);

    expect(result.subtotal).toBeLessThan(50000);
    expect(result.shippingFee).toBe(500);
    expect(result.total).toBe(result.subtotal + 500);
  });

  it("rejects non-existent product slugs", () => {
    expect(() =>
      calculateOrderTotals([{ productSlug: "non-existent-fake-product", quantity: 1 }]),
    ).toThrow("Product not found");
  });

  it("normalizes negative or decimal quantities to at least 1 unit", () => {
    const result = calculateOrderTotals([
      { productSlug: "ev-1000v-insulated-tool-kit", quantity: -5 },
    ]);
    expect(result.verifiedLines[0]!.quantity).toBe(1);
  });
});
