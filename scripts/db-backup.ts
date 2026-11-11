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

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
  console.log(`[db:backup] Starting backup to ${backupFile}...`);

  const [
    usersData,
    sessionsData,
    productsData,
    quotesData,
    bookingsData,
    bannersData,
    reviewsData,
    mediaData,
    ordersData,
    orderItemsData,
    settingsData,
    updatesData,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(sessions),
    db.select().from(productsTable),
    db.select().from(quotes),
    db.select().from(bookings),
    db.select().from(banners),
    db.select().from(reviews),
    db
      .select({
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        url: media.url,
        category: media.category,
        createdAt: media.createdAt,
      })
      .from(media),
    db.select().from(orders),
    db.select().from(orderItems),
    db.select().from(settings),
    db.select().from(updates),
  ]);

  const payload = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    counts: {
      users: usersData.length,
      sessions: sessionsData.length,
      products: productsData.length,
      quotes: quotesData.length,
      bookings: bookingsData.length,
      banners: bannersData.length,
      reviews: reviewsData.length,
      media: mediaData.length,
      orders: ordersData.length,
      orderItems: orderItemsData.length,
      settings: settingsData.length,
      updates: updatesData.length,
    },
    tables: {
      users: usersData,
      sessions: sessionsData,
      products: productsData,
      quotes: quotesData,
      bookings: bookingsData,
      banners: bannersData,
      reviews: reviewsData,
      media: mediaData,
      orders: ordersData,
      orderItems: orderItemsData,
      settings: settingsData,
      updates: updatesData,
    },
  };

  fs.writeFileSync(backupFile, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `[db:backup] Successfully created backup file (${(fs.statSync(backupFile).size / 1024).toFixed(1)} KB):`,
  );
  console.log(`  -> ${backupFile}`);
}

backup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[db:backup] Error:", err);
    process.exit(1);
  });
