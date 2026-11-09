import { test, expect } from "@playwright/test";

test.describe("PAGE International Critical User Journeys", () => {
  // ---------------------------------------------------------------------------
  // JOURNEY 1: RFQ QUOTATION SUBMISSION & SINK TO DATABASE
  // ---------------------------------------------------------------------------
  test("Journey 1: Public user submits RFQ quote and receives reference code", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("text=Catalog")).toBeVisible();

    // Click on the first product card
    const firstProduct = page.locator("a[href^='/shop/']").first();
    await firstProduct.click();

    await page.waitForURL(/\/shop\/.+/);
    await expect(page.locator("text=Request Official B2B Quotation")).toBeVisible();

    // Fill the RFQ quote form
    await page.fill(
      "input[id='quote-company'], input[placeholder*='Master Motors']",
      "Apex Engineering Garage",
    );
    await page.fill("input[placeholder*='Tanvir']", "Engr. Rezaul Karim");
    await page.fill("input[type='tel']", "+880 1711-223344");
    await page.fill("input[type='email']", "apex.workshop@gmail.com");

    // Submit RFQ
    await page.click("button:has-text('Submit Quotation Request')");

    // Success screen with generated quotation reference code
    await expect(
      page.locator("text=Quotation Request Submitted").or(page.locator("text=RFQ-")),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  // ---------------------------------------------------------------------------
  // JOURNEY 2: TECHNICAL CONSULTATION BOOKING
  // ---------------------------------------------------------------------------
  test("Journey 2: User books equipment demonstration appointment", async ({ page }) => {
    await page.goto("/services/book");
    await expect(page.locator("text=Workshop Machinery Consultation")).toBeVisible();

    // Step 1: Enterprise Information
    await page.fill("input[id='book-biz-name']", "Dhaka Express Fleet Bay");
    await page.click("button:has-text('Proceed to Consultation Mode')");

    // Step 2: Select Center Mode & Location
    await page.click("button:has-text('Select Date & Time')");

    // Step 3: Date & Time
    await page.click("button:has-text('Continue to Contact Details')");

    // Step 4: Contact Details
    await page.fill("input[id='book-contact-person']", "Karim Chowdhury");
    await page.fill("input[id='book-contact-phone']", "+880 1819-556677");
    await page.fill("input[id='book-contact-email']", "fleet@dhakaexpress.com");

    // Confirm booking
    await page.click("button:has-text('Confirm Consultation Booking')");

    // Success confirmation
    await expect(
      page.locator("text=Consultation Booked Successfully").or(page.locator("text=BOOK-")),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  // ---------------------------------------------------------------------------
  // JOURNEY 3: DIRECT ORDER & CHECKOUT
  // ---------------------------------------------------------------------------
  test("Journey 3: User adds product to cart and places commercial order", async ({ page }) => {
    await page.goto("/shop");

    // Find and add a product with Add to Cart button
    const addToCartBtn = page.locator("button:has-text('Add to Cart')").first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    } else {
      // Navigate to product detail to add
      await page.locator("a[href^='/shop/']").first().click();
      await page.waitForURL(/\/shop\/.+/);
      await page.click("button:has-text('Add to Cart')");
    }

    // Go to checkout
    await page.goto("/checkout");
    await expect(page.locator("text=Commercial Checkout")).toBeVisible();

    // Fill shipping & billing details
    await page.fill("input[placeholder*='Full Name'], input[name='name']", "Tanvir Hasan");
    await page.fill("input[type='email']", "tanvir@automaster.bd");
    await page.fill("input[type='tel']", "+880 1712-345678");
    await page.fill(
      "input[placeholder*='Road'], input[name='address']",
      "Plot 24, Road 5, Tejgaon I/A",
    );
    await page.fill("input[placeholder*='Dhaka'], input[name='city']", "Dhaka");

    // Confirm order
    await page.click("button:has-text('Confirm Commercial Order')");

    // Order confirmation
    await expect(
      page.locator("text=Order Placed Successfully").or(page.locator("text=ORD-")),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  // ---------------------------------------------------------------------------
  // JOURNEY 4: ADMIN LOGIN & DASHBOARD SESSION
  // ---------------------------------------------------------------------------
  test("Journey 4: Admin logs in with database credentials and accesses dashboard", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await expect(page.locator("text=PAGE Admin Access")).toBeVisible();

    // Login with seeded admin credentials
    await page.fill("input[type='email']", "admin@page-bd.com");
    await page.fill("input[type='password']", "PageAdmin2026!Secure");
    await page.click("button:has-text('Sign In to Admin')");

    // Admin dashboard loads
    await page.waitForURL(/\/admin/);
    await expect(page.locator("text=Overview").or(page.locator("text=Dashboard"))).toBeVisible();

    // Navigate to Inventory tab
    await page.click("a[href='/admin/inventory']");
    await page.waitForURL(/\/admin\/inventory/);
    await expect(page.locator("text=Inventory & Equipment Catalog")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // JOURNEY 5: ADMIN QUOTE REPLY
  // ---------------------------------------------------------------------------
  test("Journey 5: Admin reviews quotations in admin portal", async ({ page }) => {
    // Navigate directly to admin quotes (using authenticated session)
    await page.goto("/admin/quotes");
    await expect(page.locator("text=Quotations")).toBeVisible();

    // Quotes list is populated
    await expect(page.locator("text=total requests")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // JOURNEY 6: CUSTOMER PORTAL & ACCOUNT
  // ---------------------------------------------------------------------------
  test("Journey 6: Customer registers account and views profile dashboard", async ({ page }) => {
    const uniqueEmail = `test.client.${Date.now()}@workshop.bd`;
    await page.goto("/login");

    // Switch to Register tab
    await page.click("button:has-text('Register Workshop')");

    // Fill registration form
    await page.fill("input[placeholder*='Rahim'], input[id='reg-name']", "Engr. Monirul Islam");
    await page.fill("input[type='email']", uniqueEmail);
    await page.fill("input[type='tel']", "+880 1715-998877");
    await page.fill(
      "input[placeholder*='Motors'], input[id='reg-company']",
      "Monir Auto Engineering",
    );
    await page.fill("input[type='password']", "ClientSecret#2026");

    // Submit registration
    await page.click("button:has-text('Create Workshop Account')");

    // Redirected to customer account dashboard
    await page.waitForURL(/\/account/, { timeout: 10000 });
    await expect(page.locator("text=Workshop Account Portal")).toBeVisible();
    await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();
  });
});
