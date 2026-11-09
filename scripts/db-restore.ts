import * as fs from "node:fs";
import * as path from "node:path";
import {
  db,
  users,
  sessions,
  productsTable,
  quotes,
  bookings,
  banners,
  reviews,
  media,
  orders,
  orderItems,
  settings,
  updates,
} from "../src/db";
import { runMigrations } from "../src/db/migrate";

function parseDates(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      result[k] = new Date(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

async function restore() {
  const backupDir = path.resolve(process.cwd(), "backups");
  let targetFile = process.argv[2];

  if (!targetFile) {
    if (!fs.existsSync(backupDir)) {
      throw new Error(`No backups directory found at ${backupDir}`);
    }
    const files = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error("No backup files found in backups/ directory.");
    }
    targetFile = path.join(backupDir, files[0]);
  }

  if (!fs.existsSync(targetFile)) {
    throw new Error(`Backup file does not exist: ${targetFile}`);
  }

  console.log(`[db:restore] Reading backup file: ${targetFile}`);
  const raw = fs.readFileSync(targetFile, "utf8");
  const backup = JSON.parse(raw);

  if (!backup.tables) {
    throw new Error("Invalid backup format: missing 'tables' key");
  }

  console.log("[db:restore] Ensuring database schema is migrated...");
  await runMigrations();

  const {
    users: usersData = [],
    sessions: sessionsData = [],
    products: productsData = [],
    quotes: quotesData = [],
    bookings: bookingsData = [],
    banners: bannersData = [],
    reviews: reviewsData = [],
    media: mediaData = [],
    orders: ordersData = [],
    orderItems: orderItemsData = [],
    settings: settingsData = [],
    updates: updatesData = [],
  } = backup.tables;

  console.log("[db:restore] Restoring tables in dependency order...");

  // 1. Users
  for (const row of usersData) {
    await db
      .insert(users)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 2. Products
  for (const row of productsData) {
    await db
      .insert(productsTable)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 3. Settings
  for (const row of settingsData) {
    await db
      .insert(settings)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 4. Banners
  for (const row of bannersData) {
    await db
      .insert(banners)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 5. Reviews
  for (const row of reviewsData) {
    await db
      .insert(reviews)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 6. Media
  for (const row of mediaData) {
    await db
      .insert(media)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 7. Updates
  for (const row of updatesData) {
    await db
      .insert(updates)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 8. Quotes
  for (const row of quotesData) {
    await db
      .insert(quotes)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 9. Bookings
  for (const row of bookingsData) {
    await db
      .insert(bookings)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 10. Orders
  for (const row of ordersData) {
    await db
      .insert(orders)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 11. Order Items
  for (const row of orderItemsData) {
    await db
      .insert(orderItems)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  // 12. Sessions
  for (const row of sessionsData) {
    await db
      .insert(sessions)
      .values(parseDates(row) as any)
      .onConflictDoNothing();
  }

  console.log(`[db:restore] Successfully restored database from ${path.basename(targetFile)}!`);
}

restore()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[db:restore] Error:", err);
    process.exit(1);
  });
