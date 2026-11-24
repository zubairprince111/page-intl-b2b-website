import { db } from "../src/db";
import { productsTable } from "../src/db/schema";
import { launchProducts } from "../src/lib/launch-products";
import { notInArray } from "drizzle-orm";

async function main() {
  console.log("=== Purging Non-Launch / Fake Products from Database ===");
  const validSlugs = launchProducts.map((p) => p.slug);
  console.log(`Official Launch CN products in catalog: ${validSlugs.length}`);

  const allProductsBefore = await db.select({
    id: productsTable.id,
    slug: productsTable.slug,
    name: productsTable.name,
    brand: productsTable.brand,
  }).from(productsTable);

  console.log(`Total products currently in DB: ${allProductsBefore.length}`);

  const fakeProducts = allProductsBefore.filter((p) => !validSlugs.includes(p.slug));
  console.log(`Found ${fakeProducts.length} non-Launch products to remove:`);
  for (const f of fakeProducts) {
    console.log(` - [${f.brand}] ${f.slug}: ${f.name}`);
  }

  if (fakeProducts.length > 0) {
    const fakeSlugs = fakeProducts.map((f) => f.slug);
    await db.delete(productsTable).where(notInArray(productsTable.slug, validSlugs));
    console.log(`Successfully removed ${fakeProducts.length} fake products!`);
  } else {
    console.log("No fake products found. Database is already clean!");
  }

  const remaining = await db.select({ id: productsTable.id, slug: productsTable.slug }).from(productsTable);
  console.log(`Total verified Launch CN products in DB: ${remaining.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  });
