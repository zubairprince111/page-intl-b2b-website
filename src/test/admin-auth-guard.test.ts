import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAdminBeforeLoad } from "../lib/admin-auth";
import * as authFunctions from "../lib/auth-functions";
import * as authServer from "../lib/auth.server";
import { ensureDatabaseColumns, listInventoryCore, createInventoryItemCore } from "../lib/data.server";
import { db, productsTable } from "@/db";
import { eq } from "drizzle-orm";

describe("Admin Route Protection & Data Persistence Across Reboots", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("strictly redirects unauthenticated visitors to /admin/login at the route level", async () => {
    vi.spyOn(authFunctions, "getCurrentUserServerFn").mockResolvedValue(null);

    await expect(requireAdminBeforeLoad()).rejects.toThrow();
    try {
      await requireAdminBeforeLoad();
    } catch (err: any) {
      // TanStack Router redirects have href / to / statusCode or isRedirect
      expect(err).toBeDefined();
      expect(err?.to || err?.href || err?.options?.to).toBe("/admin/login");
    }
  });

  it("strictly redirects non-admin authenticated users (e.g. customer) to /admin/login", async () => {
    vi.spyOn(authFunctions, "getCurrentUserServerFn").mockResolvedValue({
      id: "usr-cust-1",
      name: "Customer Workshop",
      email: "cust@workshop.bd",
      phone: "+8801700000000",
      companyName: "Customer Workshop",
      businessType: "Garage",
      city: "Dhaka",
      role: "customer",
      emailVerified: true,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
    });

    try {
      await requireAdminBeforeLoad();
      expect.fail("Should have redirected non-admin user");
    } catch (err: any) {
      expect(err).toBeDefined();
      expect(err?.to || err?.href || err?.options?.to).toBe("/admin/login");
    }
  });

  it("allows authorized administrators to access /admin routes", async () => {
    const adminUser = {
      id: "usr-admin-1",
      name: "System Admin",
      email: "admin@pageintl.bd",
      phone: "+8801711111111",
      companyName: "PAGE International",
      businessType: "HQ",
      city: "Dhaka",
      role: "admin",
      emailVerified: true,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
    };
    vi.spyOn(authFunctions, "getCurrentUserServerFn").mockResolvedValue(adminUser);

    const result = await requireAdminBeforeLoad();
    expect(result.adminUser.role).toBe("admin");
    expect(result.adminUser.email).toBe("admin@pageintl.bd");
  });

  it("ensures custom products added by admin are NEVER deleted on server reboot or catalog sync", async () => {
    await ensureDatabaseColumns();

    const customSlug = `custom-unit-${Date.now()}`;
    const customProduct = {
      slug: customSlug,
      name: "Custom Diagnostic Station 9000",
      sku: `SKU-CUST-${Date.now()}`,
      brand: "LAUNCH",
      category: "Diagnostic Equipment",
      price: 250000,
      priceBdt: 250000,
      costPrice: 190000,
      warehouseQty: 14,
      reorderLevel: 2,
      inStock: true,
      mobility: ["4-Wheeler"] as ("4-Wheeler" | "2-Wheeler" | "3-Wheeler" | "EV")[],
      isEquipment: true,
      priceLabel: "Pro-Forma B2B",
      dispatchHub: "Dhaka Central Hub",
      image: "/uploads/products/launch/launch-x-431-pad9-link.png",
      description: "Custom admin unit that must persist across reboots",
      features: ["Custom Feature 1"],
      fits: ["Commercial Garages"],
      specs: [["Custom Spec", "Verified Value"]] as [string, string][],
      highlights: [["Capacity", "Heavy Duty"]] as [string, string][],
    };

    const mockAdmin = {
      id: "usr-admin-1",
      name: "System Admin",
      email: "admin@pageintl.bd",
      phone: "+8801711111111",
      companyName: "PAGE International",
      businessType: "HQ",
      city: "Dhaka",
      role: "admin",
      emailVerified: true,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
    };
    vi.spyOn(authServer, "getSessionUserCore").mockResolvedValue(mockAdmin);

    try {
      // 1. Create custom product in DB
      const createRes = await createInventoryItemCore(customProduct);
      expect(createRes.success).toBe(true);

      // 2. Trigger listInventoryCore which invokes ensureCatalogSynced() (simulating server restart / refresh)
      const inventory = await listInventoryCore();
      const foundCustom = inventory.find((p) => p.slug === customSlug);
      expect(foundCustom).toBeDefined();
      expect(foundCustom?.name).toBe("Custom Diagnostic Station 9000");
    } finally {
      // 3. Always clean up test row, even if assertions fail
      await db.delete(productsTable).where(eq(productsTable.slug, customSlug));
    }
  });
});
