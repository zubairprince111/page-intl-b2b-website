import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deriveProductStockStatus,
  getDistinctProductFeatures,
  inferIsEquipment,
  normalizeSpecsToTuples,
  parseFitsText,
  parseSpecsText,
  resolveOrderedSpecs,
  sanitizeFeatureLines,
  sanitizeSpecRows,
} from "@/lib/product-utils";
import { mapDbProductToProduct } from "@/lib/data";
import { createInventoryItemCore, updateInventoryItemCore } from "@/lib/data.server";

const { insertedProducts, updatedPayloads, auditRows, mockSessionUser, insertMock, updateMock } =
  vi.hoisted(() => {
    const prods: Record<string, unknown>[] = [];
    const updates: Record<string, unknown>[] = [];
    const audits: Record<string, unknown>[] = [];
    let sessionUser: { id: string; email: string; role: string } | null = {
      id: "admin-1",
      email: "admin@pageintl.com",
      role: "admin",
    };

    const insMock = vi.fn((table: unknown) => ({
      values: (row: Record<string, unknown>) => {
        const tblName = String(
          (table as Record<symbol, unknown> | undefined)?.[Symbol.for("drizzle:Name")] || "",
        );
        if (tblName === "products") {
          prods.push(row);
          return { returning: async () => [row] };
        }
        if (tblName === "audit_log") {
          audits.push(row);
        }
        const promise = Promise.resolve([row]) as Promise<Record<string, unknown>[]> & {
          returning: () => Promise<Record<string, unknown>[]>;
        };
        promise.returning = async () => [row];
        return promise;
      },
    }));

    const updMock = vi.fn((_table: unknown) => ({
      set: (patch: Record<string, unknown>) => ({
        where: (_cond: unknown) => ({
          returning: async () => {
            updates.push(patch);
            return [{ id: "prod-test-lift", slug: "test-lift", ...patch }];
          },
        }),
      }),
    }));

    return {
      insertedProducts: prods,
      updatedPayloads: updates,
      auditRows: audits,
      mockSessionUser: {
        get: () => sessionUser,
        set: (u: { id: string; email: string; role: string } | null) => {
          sessionUser = u;
        },
      },
      insertMock: insMock,
      updateMock: updMock,
    };
  });

vi.mock("@/lib/auth.server", () => ({
  getClientIp: () => "127.0.0.1",
  getSessionUserCore: async () => mockSessionUser.get(),
}));

vi.mock("@/db", async () => {
  const schema = await import("../db/schema");
  return {
    ...schema,
    isPostgres: false,
    rawClient: null,
    db: {
      insert: insertMock,
      update: updateMock,
      select: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("Product Technical Specifications & Overview Utilities", () => {
  it("normalizes both ordered tuple lists and legacy object maps cleanly", () => {
    expect(
      normalizeSpecsToTuples([
        ["Lifting Capacity", "4,000 kg"],
        ["  ", "ignored"],
        ["Motor", "  2.2 kW / 380V 3-Phase  "],
      ]),
    ).toEqual([
      ["Lifting Capacity", "4,000 kg"],
      ["Motor", "2.2 kW / 380V 3-Phase"],
    ]);

    expect(
      normalizeSpecsToTuples({
        "Power Supply": "220V",
        "": "blank-key",
        Warranty: "24 Months",
      }),
    ).toEqual([
      ["Power Supply", "220V"],
      ["Warranty", "24 Months"],
    ]);

    expect(normalizeSpecsToTuples(null)).toEqual([]);
  });

  it("parses bulk pasted technical specifications across colons, bullets, tabs, and equals", () => {
    const parsed = parseSpecsText(`
      - Lifting Capacity: 4,000 kg
      * Power Supply: 380V / 3-Phase
      Max Height\t1,900 mm
      Motor Rating = 2.2 kW
      Origin - Italy / CE Certified

      Invalid line without separator
    `);

    expect(parsed).toEqual([
      ["Lifting Capacity", "4,000 kg"],
      ["Power Supply", "380V / 3-Phase"],
      ["Max Height", "1,900 mm"],
      ["Motor Rating", "2.2 kW"],
      ["Origin", "Italy / CE Certified"],
    ]);
  });

  it("sanitizes editor rows, overview highlight lines, and vehicle compatibility tags", () => {
    expect(
      sanitizeSpecRows([
        { key: "  Voltage  ", value: " 380V " },
        { key: " ", value: "orphan value" },
        { key: "Warranty", value: "" },
      ]),
    ).toEqual([
      ["Voltage", "380V"],
      ["Warranty", ""],
    ]);

    expect(sanitizeFeatureLines(["  Reinforced steel  ", "", "   ", "CE Certified"])).toEqual([
      "Reinforced steel",
      "CE Certified",
    ]);

    expect(parseFitsText("Multi-Brand Cars, SUVs\nCommercial Fleet Vans")).toEqual([
      "Multi-Brand Cars",
      "SUVs",
      "Commercial Fleet Vans",
    ]);
  });

  it("filters legacy copied fits arrays out of product overview highlights", () => {
    const fits = ["Toyota Corolla Axio", "Honda Vezel"];
    expect(getDistinctProductFeatures(["Toyota Corolla Axio", "Honda Vezel"], fits)).toEqual([]);
    expect(
      getDistinctProductFeatures(["Dual hydraulic synchronization", "Auto safety latch"], fits),
    ).toEqual(["Dual hydraulic synchronization", "Auto safety latch"]);
  });

  it("preserves exact ordered tuples when array, and restores canonical static order for unedited object rows", () => {
    const fallback: [string, string][] = [
      ["Capacity", "4.0T"],
      ["Voltage", "380V"],
      ["Motor", "2.2 kW"],
    ];

    // Custom reordered array from DB stays exactly as saved
    expect(
      resolveOrderedSpecs(
        [
          ["Motor", "3.0 kW"],
          ["Capacity", "4.5T"],
        ],
        fallback,
      ),
    ).toEqual([
      ["Motor", "3.0 kW"],
      ["Capacity", "4.5T"],
    ]);

    // Legacy object re-ordered by JSONB key sorting restores fallback tuple order
    expect(
      resolveOrderedSpecs(
        {
          Motor: "2.2 kW",
          Voltage: "380V",
          Capacity: "4.0T",
        },
        fallback,
      ),
    ).toEqual(fallback);
  });

  it("maps database product row to storefront Product preserving SKU, ordered specs, and overview", () => {
    const mapped = mapDbProductToProduct({
      slug: "custom-alignment-system",
      sku: "PG-ALIGN-88",
      name: "Pro 3D Wheel Aligner",
      brand: "Launch",
      category: "Tyre & Wheel",
      mobility: ["4-Wheeler", "EV"],
      priceBdt: 685000,
      warehouseQty: 4,
      reorderLevel: 2,
      inStock: true,
      description: "High-precision 3D imaging wheel alignment platform.",
      specs: [
        ["Camera System", "Dual 5MP Industrial CMOS"],
        ["Turntable Load", "4,500 kg"],
      ],
      features: [
        "Target-based calibration without electronics on wheels",
        "Wireless cloud reporting",
      ],
      fits: ["Sedan Bays", "SUV Alignment Bays"],
      images: ["/uploads/products/aligner.jpg"],
    });

    expect(mapped.sku).toBe("PG-ALIGN-88");
    expect(mapped.stock).toBe("In stock");
    expect(mapped.isEquipment).toBe(true);
    expect(mapped.requiresQuote).toBe(true);
    expect(mapped.specs).toEqual([
      ["Camera System", "Dual 5MP Industrial CMOS"],
      ["Turntable Load", "4,500 kg"],
    ]);
    expect(mapped.features).toEqual([
      "Target-based calibration without electronics on wheels",
      "Wireless cloud reporting",
    ]);
    expect(mapped.fits).toEqual(["Sedan Bays", "SUV Alignment Bays"]);
  });

  it("infers equipment classification and stock state accurately", () => {
    expect(inferIsEquipment("Garage Equipment")).toBe(true);
    expect(inferIsEquipment("Spare Parts")).toBe(false);
    expect(deriveProductStockStatus({ inStock: true, warehouseQty: 0, reorderLevel: 2 })).toBe(
      "Out of stock",
    );
    expect(deriveProductStockStatus({ inStock: true, warehouseQty: 2, reorderLevel: 2 })).toBe(
      "Low stock",
    );
    expect(deriveProductStockStatus({ inStock: true, warehouseQty: 8, reorderLevel: 2 })).toBe(
      "In stock",
    );
  });
});

describe("Admin Inventory Create & Update Persistence", () => {
  beforeEach(() => {
    insertedProducts.length = 0;
    updatedPayloads.length = 0;
    auditRows.length = 0;
    insertMock.mockClear();
    updateMock.mockClear();
    mockSessionUser.set({
      id: "admin-1",
      email: "admin@pageintl.com",
      role: "admin",
    });
  });

  it("persists SKU, ordered Technical Specifications, Overview description, features, and fits on create", async () => {
    const res = await createInventoryItemCore({
      slug: "heavy-duty-scissor-lift-5t",
      sku: "PG-LIFT-5000",
      name: "Heavy-Duty Alignment Scissor Lift 5.0T",
      brand: "launch",
      category: "Garage Equipment",
      mobility: ["4-Wheeler", "EV"],
      isEquipment: true,
      priceBdt: 950000,
      warehouseQty: 3,
      reorderLevel: 1,
      description: "Flush-mount electro-hydraulic 5.0T scissor alignment lift.",
      specs: [
        ["Lifting Capacity", "5,000 kg"],
        ["Power Supply", "380V / 3-Phase"],
        ["Max Rise Height", "1,850 mm"],
      ],
      features: ["Built-in secondary wheel-free jack", "Anti-surge hydraulic check valves"],
      fits: ["3D Alignment Bays", "EV Service Bays"],
      images: ["/uploads/products/scissor.jpg"],
    });

    expect(res.success).toBe(true);
    expect(insertedProducts).toHaveLength(1);
    expect(insertedProducts[0]).toMatchObject({
      slug: "heavy-duty-scissor-lift-5t",
      sku: "PG-LIFT-5000",
      brand: "launch",
      isEquipment: true,
      requiresQuote: true,
      description: "Flush-mount electro-hydraulic 5.0T scissor alignment lift.",
      specs: [
        ["Lifting Capacity", "5,000 kg"],
        ["Power Supply", "380V / 3-Phase"],
        ["Max Rise Height", "1,850 mm"],
      ],
      features: ["Built-in secondary wheel-free jack", "Anti-surge hydraulic check valves"],
      fits: ["3D Alignment Bays", "EV Service Bays"],
    });
    expect(auditRows[0]).toMatchObject({ action: "inventory.create" });
  });

  it("updates ordered specs, overview, SKU, and highlights cleanly without resetting untouched fields", async () => {
    const res = await updateInventoryItemCore({
      slug: "test-lift",
      sku: "PG-REV-2",
      description: "Updated architectural overview text.",
      specs: [
        ["Rated Load", "4,500 kg"],
        ["Warranty", "36 Months"],
      ],
      features: ["Powder-coated column structure"],
    });

    expect(res.success).toBe(true);
    expect(updatedPayloads).toHaveLength(1);
    expect(updatedPayloads[0]).toMatchObject({
      sku: "PG-REV-2",
      description: "Updated architectural overview text.",
      specs: [
        ["Rated Load", "4,500 kg"],
        ["Warranty", "36 Months"],
      ],
      features: ["Powder-coated column structure"],
    });
    expect(auditRows[0]).toMatchObject({ action: "inventory.update" });
  });

  it("rejects unauthorized non-admin inventory mutations", async () => {
    mockSessionUser.set(null);

    await expect(
      createInventoryItemCore({
        slug: "unauth-test",
        name: "Unauthorized Product",
        brand: "Brand",
        category: "Spare Parts",
        priceBdt: 1000,
        description: "Test",
      }),
    ).rejects.toThrow("Unauthorized");
  });
});
