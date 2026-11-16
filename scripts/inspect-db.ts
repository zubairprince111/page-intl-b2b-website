import { db, productsTable } from "./src/db";

async function main() {
  const rows = await db.select({
    id: productsTable.id,
    slug: productsTable.slug,
    name: productsTable.name,
    brand: productsTable.brand,
    image: productsTable.image,
  }).from(productsTable);

  console.log("Total products:", rows.length);
  const customs = rows.filter(r => r.name.toLowerCase().includes("custom") || r.slug.toLowerCase().includes("custom"));
  console.log("Custom products in DB:", customs);

  const ats = rows.filter(r => r.brand === "ATS ELGI");
  console.log("ATS ELGI products in DB:", ats);

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
